/**
 * Lead Scoring Service
 * Processes visitor sessions and calculates lead scores
 */

class LeadScoring {
    constructor() {
        this.scoringRules = {
            immediate: {
                threshold: 80,
                behaviors: ['emergencyClick', 'phoneClick', 'afterHoursEmergency']
            },
            highPriority: {
                threshold: 60,
                behaviors: ['contactFormStart', 'multipleServices', 'highTimeOnSite']
            },
            standard: {
                threshold: 40,
                behaviors: ['serviceBrowsing', 'locationCheck']
            }
        };
    }

    async processSession(session) {
        const leadData = {
            sessionId: session.id,
            score: session.score || 0,
            timestamp: Date.now(),
            visitor: session.visitor,
            behavior: this.analyzeBehavior(session),
            journey: this.mapCustomerJourney(session),
            predictedService: this.predictService(session),
            estimatedValue: this.estimateValue(session),
            urgency: this.determineUrgency(session),
            location: await this.getLocation(session.ip)
        };

        // Determine alert level
        leadData.alertLevel = this.determineAlertLevel(leadData.score);

        return leadData;
    }

    analyzeBehavior(session) {
        const analysis = {
            totalTimeOnSite: (Date.now() - session.startTime) / 1000,
            pageViewCount: session.pageViews.length,
            eventCount: session.events.length,
            lastActivity: session.lastActivity,
            keyBehaviors: [],
            intentSignals: []
        };

        // Extract key behaviors
        session.events.forEach(event => {
            if (['emergencyClick', 'phoneClick', 'contactFormStart'].includes(event.type)) {
                analysis.keyBehaviors.push({
                    type: event.type,
                    timestamp: event.timestamp,
                    data: event.data
                });
            }
        });

        // Identify intent signals
        if (session.events.some(e => e.type === 'emergencyClick')) {
            analysis.intentSignals.push('emergency_need');
        }
        if (session.events.some(e => e.type === 'multipleServiceViews')) {
            analysis.intentSignals.push('researching_services');
        }
        if (analysis.totalTimeOnSite > 180) {
            analysis.intentSignals.push('high_engagement');
        }

        return analysis;
    }

    mapCustomerJourney(session) {
        return session.pageViews.map((view, index) => ({
            step: index + 1,
            page: view.title,
            url: view.url,
            timeSpent: index < session.pageViews.length - 1 
                ? (session.pageViews[index + 1].timestamp - view.timestamp) / 1000 
                : (Date.now() - view.timestamp) / 1000,
            events: session.events.filter(e => 
                e.timestamp >= view.timestamp && 
                (index === session.pageViews.length - 1 || e.timestamp < session.pageViews[index + 1].timestamp)
            ).map(e => e.type)
        }));
    }

    predictService(session) {
        const serviceInterests = {
            emergency: 0,
            plumbing: 0,
            bathroom: 0,
            kitchen: 0,
            waterHeater: 0,
            drainCleaning: 0,
            general: 0
        };

        // Analyze page views and events
        session.pageViews.forEach(view => {
            const url = view.url.toLowerCase();
            const title = view.title.toLowerCase();
            
            if (url.includes('emergency') || title.includes('emergency')) serviceInterests.emergency += 3;
            if (url.includes('bathroom') || title.includes('bathroom')) serviceInterests.bathroom += 2;
            if (url.includes('kitchen') || title.includes('kitchen')) serviceInterests.kitchen += 2;
            if (url.includes('water-heater') || title.includes('water heater')) serviceInterests.waterHeater += 2;
            if (url.includes('drain') || title.includes('drain')) serviceInterests.drainCleaning += 2;
        });

        // Analyze events
        session.events.forEach(event => {
            if (event.type === 'emergencyClick') serviceInterests.emergency += 5;
            if (event.type === 'serviceBrowse' && event.data.window) {
                const window = event.data.window.toLowerCase();
                Object.keys(serviceInterests).forEach(service => {
                    if (window.includes(service)) serviceInterests[service] += 3;
                });
            }
        });

        // Find most likely service
        const predicted = Object.entries(serviceInterests)
            .sort((a, b) => b[1] - a[1])
            .filter(([_, score]) => score > 0);

        return predicted.length > 0 ? predicted[0][0] : 'general';
    }

    estimateValue(session) {
        const service = this.predictService(session);
        const estimates = {
            emergency: { min: 150, max: 500 },
            plumbing: { min: 100, max: 300 },
            bathroom: { min: 5000, max: 15000 },
            kitchen: { min: 3000, max: 10000 },
            waterHeater: { min: 800, max: 2000 },
            drainCleaning: { min: 100, max: 400 },
            general: { min: 100, max: 500 }
        };

        const range = estimates[service] || estimates.general;
        
        // Adjust based on behavior
        let multiplier = 1;
        if (session.score >= 80) multiplier = 1.5;
        else if (session.score >= 60) multiplier = 1.2;

        return {
            min: Math.round(range.min * multiplier),
            max: Math.round(range.max * multiplier),
            service
        };
    }

    determineUrgency(session) {
        const now = new Date();
        const hour = now.getHours();
        const hasEmergencyBehavior = session.events.some(e => e.type === 'emergencyClick');
        const afterHours = hour < 8 || hour >= 18;

        if (hasEmergencyBehavior && afterHours) return 'immediate';
        if (hasEmergencyBehavior) return 'today';
        if (session.score >= 70) return 'today';
        if (session.score >= 50) return 'this_week';
        return 'future';
    }

    determineAlertLevel(score) {
        if (score >= 80) return 'immediate';
        if (score >= 60) return 'high_priority';
        if (score >= 40) return 'standard';
        if (score >= 20) return 'batch';
        return null;
    }

    async getLocation(hashedIP) {
        // In production, this would use a geolocation service
        // For now, return mock data
        return {
            city: 'Erie',
            state: 'PA',
            distance: Math.round(Math.random() * 20) + ' miles'
        };
    }
}

module.exports = LeadScoring;