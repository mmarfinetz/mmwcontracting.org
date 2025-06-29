const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import services
const leadScoringService = require('./services/leadScoringService');
const notificationService = require('./services/notificationService');
const { getAlertType, validateConfiguration } = require('./config/alertThresholds');
const auditLogger = require('./services/auditLogger');

const app = express();
const PORT = process.env.PORT || 3001;

// Validate notification configuration on startup
if (process.env.NOTIFICATION_ENABLED === 'true') {
  console.log('Validating notification configuration...');
  validateConfiguration();
}

// CORS configuration
const allowedOrigins = [
  'https://marfinetzplumbing.org',
  'https://www.marfinetzplumbing.org',
  'https://mmwcontractingorg-production.up.railway.app',
  'https://mmwcontracting.org',
  'https://www.mmwcontracting.org',
  'http://localhost:8000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:8000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];

// Add additional origins from environment variable
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Additional Vercel deployment URLs if provided
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Session-ID'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400 // 24 hours
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Lead Tracking API',
    version: '1.0.0'
  });
});

// Lead tracking endpoint
app.post('/track', async (req, res) => {
  try {
    const {
      pageUrl,
      referrer,
      timestamp,
      sessionData,
      userAgent,
      screenResolution,
      language,
      timezone
    } = req.body;

    // Validate required data
    if (!sessionData || !pageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data: sessionData and pageUrl are required'
      });
    }

    // Calculate real lead score
    const scoringResult = leadScoringService.calculateScore({
      ...sessionData,
      timestamp,
      referrer,
      userAgent
    });

    // Generate lead ID (in production, this would come from database)
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if notification should be sent (moved up for logging purposes)
    const alertType = getAlertType(scoringResult.score);
    
    // Enhanced logging for form submissions
    const isFormSubmission = sessionData.formSubmission === true || sessionData.leadSource === 'contact_form';
    
    if (isFormSubmission) {
      console.log('🚨 FORM SUBMISSION RECEIVED:', {
        leadId,
        name: sessionData.name,
        phone: sessionData.phone,
        urgency: sessionData.urgency,
        service: sessionData.service,
        message: sessionData.message,
        score: scoringResult.score,
        scoreBreakdown: scoringResult.breakdown,
        alertTriggered: alertType || 'none'
      });
    } else {
      console.log('Lead tracking data received:', {
        leadId,
        pageUrl,
        referrer,
        timestamp: new Date(timestamp),
        score: scoringResult.score,
        scoreBreakdown: scoringResult.breakdown,
        userAgent,
        screenResolution,
        language,
        timezone
      });
    }

    // TODO: Save to database
    // const leadRecord = await leadStorageService.store({
    //   leadId,
    //   pageUrl,
    //   referrer,
    //   timestamp,
    //   sessionData,
    //   userAgent,
    //   screenResolution,
    //   language,
    //   timezone,
    //   score: scoringResult.score,
    //   scoreBreakdown: scoringResult.breakdown
    // });
    
    if (alertType && process.env.NOTIFICATION_ENABLED === 'true') {
      // Send notification asynchronously (don't wait for it)
      notificationService.sendNotification({
        leadId,
        score: scoringResult.score,
        sessionData: {
          ...sessionData,
          scoreBreakdown: scoringResult.breakdown
        },
        pageUrl,
        alertType
      }).catch(error => {
        console.error('Notification error:', error);
        // Log error but don't fail the request
        auditLogger.log({
          leadId,
          score: scoringResult.score,
          alertType,
          status: 'failed',
          error: error.message
        });
      });
    }

    // Return response with real score
    res.json({
      success: true,
      leadId,
      leadScore: scoringResult.score,
      scoreFactors: scoringResult.factors,
      message: 'Lead data tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking lead:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track lead data'
    });
  }
});

// Notification stats endpoint (for monitoring)
app.get('/notifications/stats', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const stats = await auditLogger.getStats(hours);
    
    res.json({
      success: true,
      period: `Last ${hours} hours`,
      stats
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification stats'
    });
  }
});

// Rate limiter status endpoint
app.get('/notifications/rate-limits', async (req, res) => {
  try {
    const rateLimiter = require('./services/rateLimiter');
    const stats = rateLimiter.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting rate limit stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rate limit stats'
    });
  }
});

// Retry queue status endpoint
app.get('/notifications/retry-queue', async (req, res) => {
  try {
    const retryQueue = require('./services/retryQueue');
    const status = retryQueue.getQueueStatus();
    
    res.json({
      success: true,
      queue: status
    });
  } catch (error) {
    console.error('Error getting retry queue status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get retry queue status'
    });
  }
});

// Test notification endpoint (protected)
app.post('/notifications/test', async (req, res) => {
  try {
    // Simple auth check (in production, use proper authentication)
    const authToken = req.headers.authorization;
    if (authToken !== `Bearer ${process.env.API_TEST_TOKEN}`) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const { score = 85, channel = 'email' } = req.body;
    
    // Create test lead data
    const testLead = {
      leadId: `test_${Date.now()}`,
      score,
      sessionData: {
        events: [{ type: 'test' }],
        duration: 180000,
        pageViews: 5,
        scoreBreakdown: { behavior: 30, time: 20, intent: 35 }
      },
      pageUrl: 'https://marfinetzplumbing.org/test',
      alertType: getAlertType(score)
    };

    // Send test notification
    const result = await notificationService.sendNotification(testLead);
    
    res.json({
      success: true,
      message: 'Test notification sent',
      result
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Lead Tracking API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});