/**
 * Data Storage Service
 * MongoDB-based storage for sessions, alerts, analytics, and leads
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

class DataStorage {
    constructor() {
        this.client = null;
        this.db = null;
        this.collections = {};
        this.isConnected = false;
        
        // Fallback to in-memory storage if MongoDB is unavailable
        this.inMemoryMode = false;
        this.sessions = new Map();
        this.alerts = [];
    }

    async initDatabase() {
        try {
            const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/lead-tracking';
            console.log('Connecting to MongoDB:', url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

            this.client = new MongoClient(url, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 5000
            });

            await this.client.connect();
            console.log('Connected to MongoDB successfully');

            // Get database
            const dbName = url.split('/').pop().split('?')[0];
            this.db = this.client.db(dbName);

            // Initialize collections
            this.collections = {
                sessions: this.db.collection('sessions'),
                alerts: this.db.collection('alerts'),
                analytics: this.db.collection('analytics'),
                leads: this.db.collection('leads')
            };

            // Create indexes
            await this.createIndexes();
            
            this.isConnected = true;
            
            // Set up connection monitoring
            this.client.on('error', (error) => {
                console.error('MongoDB connection error:', error);
                this.handleConnectionError();
            });

            this.client.on('close', () => {
                console.log('MongoDB connection closed');
                this.isConnected = false;
            });

        } catch (error) {
            console.error('Failed to connect to MongoDB:', error.message);
            console.log('Falling back to in-memory storage mode');
            this.inMemoryMode = true;
        }
    }

    async createIndexes() {
        try {
            // Sessions indexes
            await this.collections.sessions.createIndex({ sessionId: 1 }, { unique: true });
            await this.collections.sessions.createIndex({ lastActivity: -1 });
            await this.collections.sessions.createIndex({ score: -1 });
            await this.collections.sessions.createIndex({ storedAt: -1 });
            await this.collections.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

            // Alerts indexes
            await this.collections.alerts.createIndex({ timestamp: -1 });
            await this.collections.alerts.createIndex({ level: 1 });
            await this.collections.alerts.createIndex({ sessionId: 1 });

            // Analytics indexes
            await this.collections.analytics.createIndex({ date: -1, type: 1 }, { unique: true });

            // Leads indexes
            await this.collections.leads.createIndex({ sessionId: 1 });
            await this.collections.leads.createIndex({ score: -1 });
            await this.collections.leads.createIndex({ qualifiedAt: -1 });
            await this.collections.leads.createIndex({ status: 1 });

            console.log('Database indexes created successfully');
        } catch (error) {
            console.error('Error creating indexes:', error);
        }
    }

    handleConnectionError() {
        this.isConnected = false;
        if (!this.inMemoryMode) {
            console.log('Switching to in-memory mode due to connection error');
            this.inMemoryMode = true;
        }
    }

    async storeSession(session) {
        const sessionData = {
            ...session,
            sessionId: session.id,
            storedAt: new Date(),
            expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 days
        };

        if (this.inMemoryMode) {
            this.sessions.set(session.id, sessionData);
            if (Math.random() < 0.1) this.cleanupExpiredSessions();
            return sessionData;
        }

        try {
            await this.collections.sessions.replaceOne(
                { sessionId: session.id },
                sessionData,
                { upsert: true }
            );

            // Check if this is a qualified lead (score >= 60)
            if (session.score >= 60) {
                await this.storeQualifiedLead(sessionData);
            }

            return sessionData;
        } catch (error) {
            console.error('Error storing session:', error);
            // Fallback to in-memory
            this.sessions.set(session.id, sessionData);
            return sessionData;
        }
    }

    async storeQualifiedLead(sessionData) {
        try {
            const leadData = {
                sessionId: sessionData.sessionId,
                score: sessionData.score,
                qualifiedAt: new Date(),
                visitor: sessionData.visitor,
                pageViews: sessionData.pageViews,
                events: sessionData.events,
                status: 'new',
                notes: []
            };

            await this.collections.leads.replaceOne(
                { sessionId: sessionData.sessionId },
                leadData,
                { upsert: true }
            );
        } catch (error) {
            console.error('Error storing qualified lead:', error);
        }
    }

    async getSession(sessionId) {
        if (this.inMemoryMode) {
            return this.sessions.get(sessionId);
        }

        try {
            const session = await this.collections.sessions.findOne({ sessionId });
            return session;
        } catch (error) {
            console.error('Error retrieving session:', error);
            return this.sessions.get(sessionId);
        }
    }

    async getDashboardStats() {
        const now = new Date();
        const oneDayAgo = new Date(now - (24 * 60 * 60 * 1000));
        const oneWeekAgo = new Date(now - (7 * 24 * 60 * 60 * 1000));

        if (this.inMemoryMode) {
            return this.getInMemoryStats(now, oneDayAgo, oneWeekAgo);
        }

        try {
            // Fetch recent sessions
            const recentSessions = await this.collections.sessions
                .find({ storedAt: { $gt: oneDayAgo } })
                .toArray();

            const weekSessions = await this.collections.sessions
                .find({ storedAt: { $gt: oneWeekAgo } })
                .toArray();

            // Fetch alerts
            const recentAlerts = await this.collections.alerts
                .find({ timestamp: { $gt: oneDayAgo } })
                .toArray();

            const weekAlerts = await this.collections.alerts
                .find({ timestamp: { $gt: oneWeekAgo } })
                .toArray();

            // Calculate statistics
            const stats = {
                current: {
                    activeVisitors: await this.getActiveVisitors(),
                    dailyLeads: recentSessions.length,
                    weeklyLeads: weekSessions.length,
                    highValueLeads: recentSessions.filter(s => s.score >= 60).length
                },
                scoring: {
                    averageScore: this.calculateAverageScore(recentSessions),
                    scoreDistribution: this.getScoreDistribution(recentSessions),
                    topBehaviors: this.getTopBehaviors(recentSessions)
                },
                conversion: {
                    emergencyRate: this.calculateConversionRate(recentSessions, 'emergency'),
                    contactRate: this.calculateConversionRate(recentSessions, 'contact'),
                    phoneRate: this.calculateConversionRate(recentSessions, 'phone')
                },
                alerts: {
                    today: recentAlerts.length,
                    thisWeek: weekAlerts.length,
                    byType: this.getAlertsByType(weekAlerts)
                },
                trends: {
                    hourlyVisitors: this.getHourlyTrend(recentSessions),
                    dailyVisitors: this.getDailyTrend(weekSessions),
                    topPages: this.getTopPages(recentSessions),
                    topReferrers: this.getTopReferrers(recentSessions)
                }
            };

            // Store analytics snapshot
            await this.storeAnalyticsSnapshot(stats);

            return stats;
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            return this.getInMemoryStats(now, oneDayAgo, oneWeekAgo);
        }
    }

    async storeAnalyticsSnapshot(stats) {
        try {
            const snapshot = {
                date: new Date(),
                type: 'hourly',
                metrics: {
                    activeVisitors: stats.current.activeVisitors,
                    dailyLeads: stats.current.dailyLeads,
                    averageScore: stats.scoring.averageScore,
                    conversions: stats.conversion
                }
            };

            await this.collections.analytics.insertOne(snapshot);
        } catch (error) {
            console.error('Error storing analytics snapshot:', error);
        }
    }

    async storeAlert(alertData) {
        const alert = {
            ...alertData,
            timestamp: new Date()
        };

        if (this.inMemoryMode) {
            this.alerts.push(alert);
            return;
        }

        try {
            await this.collections.alerts.insertOne(alert);
        } catch (error) {
            console.error('Error storing alert:', error);
            this.alerts.push(alert);
        }
    }

    // Helper methods
    async getActiveVisitors() {
        const fiveMinutesAgo = new Date(Date.now() - (5 * 60 * 1000));
        
        if (this.inMemoryMode) {
            return Array.from(this.sessions.values())
                .filter(s => s.lastActivity > fiveMinutesAgo).length;
        }

        try {
            return await this.collections.sessions.countDocuments({
                lastActivity: { $gt: fiveMinutesAgo }
            });
        } catch (error) {
            console.error('Error counting active visitors:', error);
            return 0;
        }
    }

    calculateAverageScore(sessions) {
        if (sessions.length === 0) return 0;
        const total = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
        return Math.round(total / sessions.length);
    }

    getScoreDistribution(sessions) {
        const distribution = {
            '0-20': 0,
            '21-40': 0,
            '41-60': 0,
            '61-80': 0,
            '81-100': 0
        };

        sessions.forEach(s => {
            const score = s.score || 0;
            if (score <= 20) distribution['0-20']++;
            else if (score <= 40) distribution['21-40']++;
            else if (score <= 60) distribution['41-60']++;
            else if (score <= 80) distribution['61-80']++;
            else distribution['81-100']++;
        });

        return distribution;
    }

    getTopBehaviors(sessions) {
        const behaviors = {};
        
        sessions.forEach(session => {
            if (session.events) {
                session.events.forEach(event => {
                    behaviors[event.type] = (behaviors[event.type] || 0) + 1;
                });
            }
        });

        return Object.entries(behaviors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([behavior, count]) => ({ behavior, count }));
    }

    calculateConversionRate(sessions, type) {
        if (sessions.length === 0) return 0;
        
        let converted = 0;
        sessions.forEach(session => {
            if (session.events) {
                if (type === 'emergency' && session.events.some(e => e.type === 'emergencyClick')) converted++;
                if (type === 'contact' && session.events.some(e => e.type === 'contactFormStart')) converted++;
                if (type === 'phone' && session.events.some(e => e.type === 'phoneClick')) converted++;
            }
        });

        return Math.round((converted / sessions.length) * 100);
    }

    getAlertsByType(alerts) {
        const types = {};
        alerts.forEach(alert => {
            types[alert.level] = (types[alert.level] || 0) + 1;
        });
        return types;
    }

    getHourlyTrend(sessions) {
        const hourly = Array(24).fill(0);
        
        sessions.forEach(session => {
            if (session.startTime) {
                const hour = new Date(session.startTime).getHours();
                hourly[hour]++;
            }
        });

        return hourly.map((count, hour) => ({
            hour: `${hour}:00`,
            visitors: count
        }));
    }

    getDailyTrend(sessions) {
        const daily = {};
        
        sessions.forEach(session => {
            if (session.startTime) {
                const date = new Date(session.startTime).toLocaleDateString();
                daily[date] = (daily[date] || 0) + 1;
            }
        });

        return Object.entries(daily)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, count]) => ({ date, visitors: count }));
    }

    getTopPages(sessions) {
        const pages = {};
        
        sessions.forEach(session => {
            if (session.pageViews) {
                session.pageViews.forEach(view => {
                    const key = view.title || view.url;
                    pages[key] = (pages[key] || 0) + 1;
                });
            }
        });

        return Object.entries(pages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([page, views]) => ({ page, views }));
    }

    getTopReferrers(sessions) {
        const referrers = {};
        
        sessions.forEach(session => {
            const referrer = session.visitor?.referrer || 'Direct';
            const source = this.parseReferrer(referrer);
            referrers[source] = (referrers[source] || 0) + 1;
        });

        return Object.entries(referrers)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([source, count]) => ({ source, count }));
    }

    parseReferrer(referrer) {
        if (!referrer || referrer === '') return 'Direct';
        if (referrer.includes('google')) return 'Google';
        if (referrer.includes('facebook')) return 'Facebook';
        if (referrer.includes('bing')) return 'Bing';
        if (referrer.includes('yahoo')) return 'Yahoo';
        
        try {
            const url = new URL(referrer);
            return url.hostname;
        } catch {
            return 'Other';
        }
    }

    // In-memory fallback methods
    getInMemoryStats(now, oneDayAgo, oneWeekAgo) {
        const allSessions = Array.from(this.sessions.values());
        const recentSessions = allSessions.filter(s => s.storedAt > oneDayAgo);
        const weekSessions = allSessions.filter(s => s.storedAt > oneWeekAgo);

        return {
            current: {
                activeVisitors: this.getActiveVisitors(),
                dailyLeads: recentSessions.length,
                weeklyLeads: weekSessions.length,
                highValueLeads: recentSessions.filter(s => s.score >= 60).length
            },
            scoring: {
                averageScore: this.calculateAverageScore(recentSessions),
                scoreDistribution: this.getScoreDistribution(recentSessions),
                topBehaviors: this.getTopBehaviors(recentSessions)
            },
            conversion: {
                emergencyRate: this.calculateConversionRate(recentSessions, 'emergency'),
                contactRate: this.calculateConversionRate(recentSessions, 'contact'),
                phoneRate: this.calculateConversionRate(recentSessions, 'phone')
            },
            alerts: {
                today: this.alerts.filter(a => a.timestamp > oneDayAgo).length,
                thisWeek: this.alerts.filter(a => a.timestamp > oneWeekAgo).length,
                byType: this.getAlertsByType(this.alerts)
            },
            trends: {
                hourlyVisitors: this.getHourlyTrend(recentSessions),
                dailyVisitors: this.getDailyTrend(weekSessions),
                topPages: this.getTopPages(recentSessions),
                topReferrers: this.getTopReferrers(recentSessions)
            }
        };
    }

    cleanupExpiredSessions() {
        const now = Date.now();
        let cleaned = 0;
        
        this.sessions.forEach((session, id) => {
            if (session.expiresAt < now) {
                this.sessions.delete(id);
                cleaned++;
            }
        });

        if (cleaned > 0) {
            console.log(`Cleaned up ${cleaned} expired sessions`);
        }
    }

    // Graceful shutdown
    async close() {
        if (this.client) {
            await this.client.close();
            console.log('MongoDB connection closed');
        }
    }
}

module.exports = DataStorage;