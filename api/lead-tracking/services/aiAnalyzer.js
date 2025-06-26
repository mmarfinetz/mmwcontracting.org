/**
 * AI Analyzer Service
 * Uses Claude API to provide intelligent lead insights
 */

const Anthropic = require('@anthropic-ai/sdk');

class AIAnalyzer {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
    }

    async analyzeSession(session) {
        try {
            const prompt = this.buildAnalysisPrompt(session);
            
            const response = await this.anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 500,
                temperature: 0.7,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const insights = this.parseAIResponse(response.content[0].text);
            return insights;
        } catch (error) {
            console.error('AI analysis failed:', error);
            return this.getFallbackInsights(session);
        }
    }

    buildAnalysisPrompt(session) {
        const behavior = session.events.map(e => `- ${e.type}: ${JSON.stringify(e.data)}`).join('\n');
        const journey = session.pageViews.map(pv => `- ${pv.title} (${pv.url})`).join('\n');
        
        return `Analyze this plumbing service website visitor's behavior and provide actionable insights.

Visitor Information:
- Score: ${session.score}/100
- Device: ${session.visitor.device}
- Time on site: ${Math.round((Date.now() - session.startTime) / 60000)} minutes
- Pages viewed: ${session.pageViews.length}

Behavior Events:
${behavior}

Page Journey:
${journey}

Based on this data, provide:
1. A brief summary of the visitor's intent (1-2 sentences)
2. The most likely service they need
3. Their urgency level (immediate, today, this week, or future)
4. The recommended action for the business owner
5. Any red flags or special considerations

Format your response as JSON with keys: summary, service, urgency, recommendedAction, considerations`;
    }

    parseAIResponse(response) {
        try {
            // Try to parse JSON response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error('Failed to parse AI response:', error);
        }

        // Fallback parsing
        return {
            summary: this.extractSection(response, 'summary') || 'High-intent visitor showing strong interest in services',
            service: this.extractSection(response, 'service') || 'General plumbing',
            urgency: this.extractSection(response, 'urgency') || 'today',
            recommendedAction: this.extractSection(response, 'recommended') || 'Call within 2 hours',
            considerations: this.extractSection(response, 'considerations') || 'None identified'
        };
    }

    extractSection(text, keyword) {
        const regex = new RegExp(`${keyword}[:\s]+([^\\n]+)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : null;
    }

    getFallbackInsights(session) {
        // Intelligent fallback based on behavior patterns
        const hasEmergency = session.events.some(e => e.type === 'emergencyClick');
        const hasPhone = session.events.some(e => e.type === 'phoneClick');
        const timeOnSite = (Date.now() - session.startTime) / 60000;
        
        let summary = 'Visitor showing interest in plumbing services';
        let urgency = 'this_week';
        let recommendedAction = 'Follow up within 24 hours';

        if (hasEmergency) {
            summary = 'Visitor has an urgent plumbing emergency requiring immediate attention';
            urgency = 'immediate';
            recommendedAction = 'Call immediately - potential emergency situation';
        } else if (hasPhone) {
            summary = 'High-intent visitor attempting to make contact via phone';
            urgency = 'today';
            recommendedAction = 'Call within 2 hours while interest is high';
        } else if (timeOnSite > 3) {
            summary = 'Engaged visitor researching services thoroughly';
            urgency = 'today';
            recommendedAction = 'Reach out same day with personalized service information';
        }

        return {
            summary,
            service: this.predictServiceFromBehavior(session),
            urgency,
            recommendedAction,
            considerations: this.identifyConsiderations(session)
        };
    }

    predictServiceFromBehavior(session) {
        const pageKeywords = session.pageViews.map(pv => 
            pv.title.toLowerCase() + ' ' + pv.url.toLowerCase()
        ).join(' ');

        if (pageKeywords.includes('emergency')) return 'Emergency plumbing';
        if (pageKeywords.includes('bathroom')) return 'Bathroom renovation';
        if (pageKeywords.includes('kitchen')) return 'Kitchen plumbing';
        if (pageKeywords.includes('water heater')) return 'Water heater service';
        if (pageKeywords.includes('drain')) return 'Drain cleaning';
        
        return 'General plumbing services';
    }

    identifyConsiderations(session) {
        const considerations = [];
        const hour = new Date().getHours();
        const isAfterHours = hour < 8 || hour >= 18;
        
        if (isAfterHours) {
            considerations.push('After-hours visit indicates urgent need');
        }
        
        if (session.events.filter(e => e.type === 'emergencyClick').length > 2) {
            considerations.push('Multiple emergency clicks suggest high stress situation');
        }
        
        if (session.visitor.device === 'mobile' && session.events.some(e => e.type === 'phoneClick')) {
            considerations.push('Mobile user trying to call - likely on-location emergency');
        }

        return considerations.join('; ') || 'None identified';
    }
}

module.exports = AIAnalyzer;