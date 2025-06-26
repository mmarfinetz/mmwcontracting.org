/**
 * Lead Tracking API
 * Handles event collection, scoring, and alert dispatching
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Services
const LeadScoring = require('./services/leadScoring');
const AlertDispatcher = require('./services/alertDispatcher');
const DataStorage = require('./services/dataStorage');
const AIAnalyzer = require('./services/aiAnalyzer');

const app = express();

// Middleware
app.use(cors({
    origin: ['https://marfinetzplumbing.org', 'https://www.marfinetzplumbing.org'],
    credentials: true
}));
app.use(bodyParser.json());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100 // limit each IP to 100 requests per minute
});
app.use('/track', limiter);

// Initialize services
const leadScoring = new LeadScoring();
const alertDispatcher = new AlertDispatcher();
const dataStorage = new DataStorage();
const aiAnalyzer = new AIAnalyzer();

// Routes
app.post('/track', async (req, res) => {
    try {
        const { session, timestamp } = req.body;
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        // Add IP to session data
        session.ip = hashIP(clientIP);
        
        // Store raw event data
        await dataStorage.storeSession(session);
        
        // Process lead scoring
        const leadData = await leadScoring.processSession(session);
        
        // AI analysis for high-value leads
        if (leadData.score >= 60) {
            const aiInsights = await aiAnalyzer.analyzeSession(session);
            leadData.aiInsights = aiInsights;
        }
        
        // Check for alerts
        if (leadData.alertLevel) {
            await alertDispatcher.sendAlert(leadData);
        }
        
        res.json({ 
            success: true, 
            sessionId: session.id,
            score: leadData.score 
        });
        
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ success: false });
    }
});

// Get lead analytics
app.get('/analytics/:sessionId', async (req, res) => {
    try {
        const sessionData = await dataStorage.getSession(req.params.sessionId);
        if (!sessionData) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.json(sessionData);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to retrieve analytics' });
    }
});

// Dashboard data endpoint
app.get('/dashboard/stats', async (req, res) => {
    try {
        const stats = await dataStorage.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to retrieve stats' });
    }
});

// Helper functions
function hashIP(ip) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(ip + process.env.IP_SALT).digest('hex').substring(0, 16);
}

// Start server
const PORT = process.env.PORT || 3001;

// Initialize database before starting server
async function startServer() {
    try {
        await dataStorage.initDatabase();
        
        app.listen(PORT, () => {
            console.log(`Lead tracking API running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;