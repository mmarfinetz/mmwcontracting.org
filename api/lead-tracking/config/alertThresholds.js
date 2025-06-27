const ALERT_THRESHOLDS = {
  IMMEDIATE: {
    minScore: 80,
    channels: ['sms', 'email'],
    priority: 'high',
    smsTemplate: 'immediate-alert-sms',
    emailTemplate: 'immediate-alert-email',
    recipients: {
      sms: process.env.EMERGENCY_PHONE_NUMBERS ? process.env.EMERGENCY_PHONE_NUMBERS.split(',') : [],
      email: process.env.EMERGENCY_EMAILS ? process.env.EMERGENCY_EMAILS.split(',') : []
    },
    description: 'Emergency lead requiring immediate attention'
  },
  HIGH_PRIORITY: {
    minScore: 60,
    maxScore: 79,
    channels: ['email'],
    priority: 'medium',
    emailTemplate: 'high-priority-email',
    recipients: {
      email: process.env.HIGH_PRIORITY_EMAILS ? process.env.HIGH_PRIORITY_EMAILS.split(',') : []
    },
    description: 'High-value lead requiring prompt follow-up'
  },
  STANDARD: {
    minScore: 40,
    maxScore: 59,
    channels: ['email'],
    priority: 'low',
    emailTemplate: 'standard-alert-email',
    recipients: {
      email: process.env.STANDARD_EMAILS ? process.env.STANDARD_EMAILS.split(',') : []
    },
    description: 'Standard lead for regular follow-up'
  }
};

// Helper function to determine alert type based on score
function getAlertType(score) {
  for (const [alertType, config] of Object.entries(ALERT_THRESHOLDS)) {
    if (score >= config.minScore && (!config.maxScore || score <= config.maxScore)) {
      return alertType;
    }
  }
  return null; // No alert for scores below minimum threshold
}

// Helper function to validate configuration
function validateConfiguration() {
  const errors = [];
  
  // Check if notification is enabled
  if (process.env.NOTIFICATION_ENABLED !== 'true') {
    console.warn('Notifications are disabled. Set NOTIFICATION_ENABLED=true to enable.');
    return false;
  }

  // Check Twilio configuration
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    errors.push('Twilio credentials missing. SMS notifications will be disabled.');
  }

  // Check AWS SES configuration
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    errors.push('AWS credentials missing. Email notifications will be disabled.');
  }

  // Check recipient configuration
  let hasRecipients = false;
  for (const config of Object.values(ALERT_THRESHOLDS)) {
    if (config.recipients.sms?.length > 0 || config.recipients.email?.length > 0) {
      hasRecipients = true;
      break;
    }
  }

  if (!hasRecipients) {
    errors.push('No notification recipients configured. Add phone numbers or emails to environment variables.');
  }

  if (errors.length > 0) {
    console.warn('Notification configuration warnings:', errors);
  }

  return errors.length === 0;
}

module.exports = {
  ALERT_THRESHOLDS,
  getAlertType,
  validateConfiguration
};