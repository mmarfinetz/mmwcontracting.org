const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

    // Log the tracking data (in production, save to database)
    console.log('Lead tracking data received:', {
      pageUrl,
      referrer,
      timestamp: new Date(timestamp),
      sessionData,
      userAgent,
      screenResolution,
      language,
      timezone
    });

    // TODO: Implement actual lead scoring logic
    // TODO: Save to database
    // TODO: Send alerts if high-value lead
    
    // For now, return a mock response
    res.json({
      success: true,
      leadScore: Math.floor(Math.random() * 100),
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