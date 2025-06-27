const AWS = require('aws-sdk');
const twilio = require('twilio');

class NotificationService {
  constructor() {
    // Initialize Twilio client
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.twilioEnabled = true;
    } else {
      console.warn('Twilio credentials not found. SMS notifications disabled.');
      this.twilioEnabled = false;
    }

    // Initialize AWS SES client
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.ses = new AWS.SES({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      });
      this.sesEnabled = true;
    } else {
      console.warn('AWS credentials not found. Email notifications disabled.');
      this.sesEnabled = false;
    }

    // Initialize rate limiter and retry queue
    this.rateLimiter = require('./rateLimiter');
    this.retryQueue = require('./retryQueue');
    this.auditLogger = require('./auditLogger');
  }

  async sendNotification(data) {
    const { leadId, score, sessionData, pageUrl, alertType } = data;

    try {
      // Get alert configuration
      const alertConfig = require('../config/alertThresholds')[alertType];
      if (!alertConfig) {
        throw new Error(`Unknown alert type: ${alertType}`);
      }

      const notificationPromises = [];

      // Send SMS if configured
      if (alertConfig.channels.includes('sms') && this.twilioEnabled) {
        for (const phoneNumber of alertConfig.recipients.sms || []) {
          if (await this.rateLimiter.canSend('sms', phoneNumber)) {
            notificationPromises.push(
              this.sendSMS(phoneNumber, alertConfig.smsTemplate, {
                leadId,
                score,
                pageName: this.extractPageName(pageUrl),
                phoneNumber: sessionData.phoneNumber || 'Not provided',
                dashboardUrl: process.env.DASHBOARD_URL || 'https://marfinetzplumbing.org/dashboard'
              })
            );
          }
        }
      }

      // Send Email if configured
      if (alertConfig.channels.includes('email') && this.sesEnabled) {
        for (const emailAddress of alertConfig.recipients.email || []) {
          if (await this.rateLimiter.canSend('email', emailAddress)) {
            notificationPromises.push(
              this.sendEmail(
                emailAddress,
                alertConfig.emailTemplate,
                {
                  leadId,
                  score,
                  sessionData,
                  pageUrl,
                  timestamp: new Date().toISOString(),
                  dashboardUrl: process.env.DASHBOARD_URL || 'https://marfinetzplumbing.org/dashboard'
                }
              )
            );
          }
        }
      }

      // Execute all notifications in parallel
      const results = await Promise.allSettled(notificationPromises);

      // Log results
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error('Notification failed:', result.reason);
          // Add to retry queue
          this.retryQueue.add({
            ...data,
            error: result.reason,
            attempt: 1
          });
        }
      });

      return { success: true, results };
    } catch (error) {
      console.error('Notification service error:', error);
      await this.auditLogger.log({
        leadId,
        score,
        alertType,
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  async sendSMS(phoneNumber, template, data) {
    try {
      // Get SMS template
      const templates = require('../templates/sms');
      let message = templates[template] || templates.default;

      // Replace placeholders
      Object.keys(data).forEach(key => {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
      });

      // Send SMS via Twilio
      const result = await this.twilioClient.messages.create({
        body: message,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
      });

      // Record usage and log
      await this.rateLimiter.recordUsage('sms', phoneNumber);
      await this.auditLogger.log({
        channel: 'sms',
        recipient: phoneNumber,
        status: 'sent',
        messageId: result.sid,
        leadId: data.leadId
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      await this.auditLogger.log({
        channel: 'sms',
        recipient: phoneNumber,
        status: 'failed',
        error: error.message,
        leadId: data.leadId
      });
      throw error;
    }
  }

  async sendEmail(emailAddress, template, data) {
    try {
      // Load email template
      const { getEmailTemplate } = require('../templates/email');
      const emailContent = await getEmailTemplate(template, data);

      // Prepare email parameters
      const params = {
        Destination: {
          ToAddresses: [emailAddress]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: emailContent.html
            },
            Text: {
              Charset: 'UTF-8',
              Data: emailContent.text
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: emailContent.subject
          }
        },
        Source: `${process.env.AWS_SES_FROM_NAME} <${process.env.AWS_SES_FROM_EMAIL}>`,
        ReplyToAddresses: [process.env.AWS_SES_FROM_EMAIL]
      };

      // Send email via AWS SES
      const result = await this.ses.sendEmail(params).promise();

      // Record usage and log
      await this.rateLimiter.recordUsage('email', emailAddress);
      await this.auditLogger.log({
        channel: 'email',
        recipient: emailAddress,
        status: 'sent',
        messageId: result.MessageId,
        leadId: data.leadId
      });

      return { success: true, messageId: result.MessageId };
    } catch (error) {
      await this.auditLogger.log({
        channel: 'email',
        recipient: emailAddress,
        status: 'failed',
        error: error.message,
        leadId: data.leadId
      });
      throw error;
    }
  }

  extractPageName(url) {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      // Extract meaningful page name
      if (path === '/' || path === '') return 'Homepage';
      
      // Remove file extension and clean up
      return path
        .replace(/^\//, '')
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    } catch (error) {
      return 'Unknown Page';
    }
  }
}

// Export singleton instance
module.exports = new NotificationService();