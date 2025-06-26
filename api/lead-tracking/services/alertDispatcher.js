/**
 * Alert Dispatcher Service
 * Sends notifications via SMS and email based on lead priority
 */

class AlertDispatcher {
    constructor() {
        this.twilioClient = this.initTwilio();
        this.emailService = this.initEmailService();
        
        this.templates = {
            sms: {
                emergency: '🚨 EMERGENCY LEAD - Score: {score}/100\nService: {service}\nLocation: {location}\nView: {link}',
                highPriority: '🔥 Hot Lead - Score: {score}/100\n{service} in {location}\nDetails: {link}',
                standard: 'New Lead: {score}/100 - {service}'
            },
            email: {
                emergency: {
                    subject: '🚨 EMERGENCY LEAD - Immediate Action Required',
                    template: 'emergency-lead'
                },
                highPriority: {
                    subject: 'High Priority Lead - {service} Interest',
                    template: 'high-priority-lead'
                },
                standard: {
                    subject: 'New Lead Alert - {service}',
                    template: 'standard-lead'
                }
            }
        };

        this.recipients = {
            sms: process.env.ALERT_PHONE || '+18142736315',
            email: process.env.ALERT_EMAIL || 'admin@marfinetzplumbing.org'
        };
    }

    initTwilio() {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            const twilio = require('twilio');
            return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }
        return null;
    }

    initEmailService() {
        // AWS SES configuration
        const AWS = require('aws-sdk');
        AWS.config.update({ region: 'us-east-1' });
        return new AWS.SES({ apiVersion: '2010-12-01' });
    }

    async sendAlert(leadData) {
        const alerts = [];

        // Determine which alerts to send based on level
        switch (leadData.alertLevel) {
            case 'immediate':
                alerts.push(this.sendSMS(leadData, 'emergency'));
                alerts.push(this.sendEmail(leadData, 'emergency'));
                // Could also trigger phone call here
                break;
            case 'high_priority':
                alerts.push(this.sendSMS(leadData, 'highPriority'));
                alerts.push(this.sendEmail(leadData, 'highPriority'));
                break;
            case 'standard':
                alerts.push(this.sendEmail(leadData, 'standard'));
                break;
            case 'batch':
                // These are collected for daily summary
                await this.addToBatchQueue(leadData);
                break;
        }

        // Send all alerts concurrently
        const results = await Promise.allSettled(alerts);
        
        // Log results
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Alert ${index} failed:`, result.reason);
            }
        });

        return results;
    }

    async sendSMS(leadData, templateType) {
        if (!this.twilioClient) {
            console.log('SMS Alert (Twilio not configured):', this.formatSMS(leadData, templateType));
            return;
        }

        const message = this.formatSMS(leadData, templateType);

        try {
            const result = await this.twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: this.recipients.sms
            });
            
            console.log('SMS sent:', result.sid);
            return result;
        } catch (error) {
            console.error('SMS send failed:', error);
            throw error;
        }
    }

    formatSMS(leadData, templateType) {
        let message = this.templates.sms[templateType];
        
        // Replace placeholders
        message = message.replace('{score}', leadData.score);
        message = message.replace('{service}', this.formatService(leadData.predictedService));
        message = message.replace('{location}', `${leadData.location.city}, ${leadData.location.state}`);
        message = message.replace('{link}', `https://leads.marfinetzplumbing.org/s/${leadData.sessionId}`);
        
        return message;
    }

    async sendEmail(leadData, templateType) {
        const emailTemplate = this.templates.email[templateType];
        const subject = emailTemplate.subject
            .replace('{service}', this.formatService(leadData.predictedService));

        const htmlBody = this.generateEmailHTML(leadData, templateType);

        const params = {
            Destination: {
                ToAddresses: [this.recipients.email]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: htmlBody
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject
                }
            },
            Source: 'alerts@marfinetzplumbing.org'
        };

        try {
            const result = await this.emailService.sendEmail(params).promise();
            console.log('Email sent:', result.MessageId);
            return result;
        } catch (error) {
            console.error('Email send failed:', error);
            // Fallback to console logging in development
            console.log('Email Alert:', { subject, leadData });
        }
    }

    generateEmailHTML(leadData, templateType) {
        const urgencyColors = {
            immediate: '#ff0000',
            today: '#ff6600',
            this_week: '#ffaa00',
            future: '#00aa00'
        };

        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .header { background: ${urgencyColors[leadData.urgency]}; color: white; padding: 20px; }
        .content { padding: 20px; }
        .score { font-size: 48px; font-weight: bold; }
        .behavior-list { background: #f5f5f5; padding: 15px; margin: 10px 0; }
        .journey { border-left: 3px solid #0066cc; padding-left: 15px; margin: 20px 0; }
        .cta { background: #0066cc; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${templateType === 'emergency' ? '🚨 EMERGENCY' : '🔥 HIGH PRIORITY'} LEAD ALERT</h1>
        <div class="score">${leadData.score}/100</div>
    </div>
    
    <div class="content">
        <h2>Lead Summary</h2>
        <ul>
            <li><strong>Service Needed:</strong> ${this.formatService(leadData.predictedService)}</li>
            <li><strong>Estimated Value:</strong> $${leadData.estimatedValue.min} - $${leadData.estimatedValue.max}</li>
            <li><strong>Location:</strong> ${leadData.location.city}, ${leadData.location.state} (${leadData.location.distance} away)</li>
            <li><strong>Device:</strong> ${leadData.visitor.device}</li>
            <li><strong>Urgency:</strong> ${leadData.urgency.toUpperCase()}</li>
        </ul>

        <h2>Visitor Behavior</h2>
        <div class="behavior-list">
            <ul>
                ${leadData.behavior.keyBehaviors.map(b => 
                    `<li>${this.formatBehavior(b.type)} at ${new Date(b.timestamp).toLocaleTimeString()}</li>`
                ).join('')}
                <li>Time on site: ${Math.round(leadData.behavior.totalTimeOnSite / 60)} minutes</li>
                <li>Pages viewed: ${leadData.behavior.pageViewCount}</li>
            </ul>
        </div>

        <h2>Customer Journey</h2>
        <div class="journey">
            ${leadData.journey.map(step => 
                `<div style="margin-bottom: 10px;">
                    <strong>Step ${step.step}:</strong> ${step.page}<br>
                    <small>Time spent: ${Math.round(step.timeSpent)}s | Actions: ${step.events.join(', ') || 'None'}</small>
                </div>`
            ).join('')}
        </div>

        ${leadData.aiInsights ? `
        <h2>AI Insights</h2>
        <div class="behavior-list">
            <p>${leadData.aiInsights.summary}</p>
            <p><strong>Recommended Action:</strong> ${leadData.aiInsights.recommendedAction}</p>
        </div>
        ` : ''}

        <a href="https://leads.marfinetzplumbing.org/session/${leadData.sessionId}" class="cta">
            View Full Session Details
        </a>
    </div>
</body>
</html>`;

        return html;
    }

    async addToBatchQueue(leadData) {
        // Store for daily summary
        // In production, this would use a queue service like SQS
        console.log('Added to batch queue:', leadData.sessionId);
    }

    formatService(service) {
        const serviceNames = {
            emergency: 'Emergency Plumbing',
            plumbing: 'General Plumbing',
            bathroom: 'Bathroom Renovation',
            kitchen: 'Kitchen Plumbing',
            waterHeater: 'Water Heater Service',
            drainCleaning: 'Drain Cleaning',
            general: 'Plumbing Services'
        };
        return serviceNames[service] || service;
    }

    formatBehavior(behavior) {
        const behaviorDescriptions = {
            emergencyClick: 'Clicked emergency services',
            phoneClick: 'Clicked phone number',
            contactFormStart: 'Started contact form',
            multipleServiceViews: 'Viewed multiple services',
            timeOnSite2Min: 'Spent over 2 minutes on site'
        };
        return behaviorDescriptions[behavior] || behavior;
    }
}

module.exports = AlertDispatcher;