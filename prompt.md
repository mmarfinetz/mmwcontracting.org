# Lead Tracking Notification System Implementation Plan

## Overview
Implement a production-ready notification system for the Marfinetz Plumbing lead tracking API that sends real-time email and SMS alerts when high-value leads are detected. The system will use Twilio for SMS notifications and AWS SES for email notifications.

## Architecture

### Core Components
1. **Notification Service Module** - Centralized service handling all notification logic
2. **Alert Threshold Engine** - Determines when and what type of notifications to send
3. **Template Manager** - Manages email/SMS templates with dynamic content
4. **Rate Limiter** - Prevents notification spam and manages costs
5. **Retry Queue** - Handles failed notifications with exponential backoff
6. **Audit Logger** - Tracks all notification attempts for compliance

## Implementation Plan

### Phase 1: Core Notification Infrastructure

#### 1.1 Create Notification Service (`/api/lead-tracking/services/notificationService.js`)
```javascript
// Core notification service structure
class NotificationService {
  constructor() {
    this.twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.ses = new AWS.SES({ region: process.env.AWS_REGION });
    this.rateLimiter = new RateLimiter();
    this.retryQueue = new RetryQueue();
  }
  
  async sendNotification(lead, alertType) {
    // Main notification orchestration
  }
  
  async sendSMS(phoneNumber, message, leadData) {
    // Twilio SMS implementation
  }
  
  async sendEmail(emailAddress, subject, body, leadData) {
    // AWS SES email implementation
  }
}
```

#### 1.2 Alert Threshold Configuration (`/api/lead-tracking/config/alertThresholds.js`)
```javascript
const ALERT_THRESHOLDS = {
  IMMEDIATE: {
    minScore: 80,
    channels: ['sms', 'email'],
    priority: 'high',
    smsTemplate: 'immediate-alert-sms',
    emailTemplate: 'immediate-alert-email',
    recipients: {
      sms: process.env.EMERGENCY_PHONE_NUMBERS.split(','),
      email: process.env.EMERGENCY_EMAILS.split(',')
    }
  },
  HIGH_PRIORITY: {
    minScore: 60,
    maxScore: 79,
    channels: ['email'],
    priority: 'medium',
    emailTemplate: 'high-priority-email',
    recipients: {
      email: process.env.HIGH_PRIORITY_EMAILS.split(',')
    }
  },
  STANDARD: {
    minScore: 40,
    maxScore: 59,
    channels: ['email'],
    priority: 'low',
    emailTemplate: 'standard-alert-email',
    recipients: {
      email: process.env.STANDARD_EMAILS.split(',')
    }
  }
};
```

### Phase 2: Lead Scoring Implementation

#### 2.1 Replace Mock Scoring (`/api/lead-tracking/services/leadScoringService.js`)
```javascript
class LeadScoringService {
  calculateScore(sessionData) {
    let score = 0;
    const scoring = {
      behavior: {
        emergencyClick: 30,
        phoneClick: 25,
        contactFormStart: 20,
        multipleServiceViews: 15,
        testimonialRead: 10,
        timeOnSite2Min: 15,
        pagesViewed3Plus: 10
      },
      time: {
        afterHours: 20,
        weekend: 10,
        businessHours: 5
      },
      intent: {
        returnVisitor: 15,
        directEmergencyNav: 25,
        emergencySearchKeywords: 20
      }
    };
    
    // Calculate score based on events
    // Return final score and breakdown
  }
}
```

### Phase 3: Notification Templates

#### 3.1 Email Templates (`/api/lead-tracking/templates/email/`)
- `immediate-alert.html` - Emergency lead notification
- `high-priority.html` - High-value lead notification
- `standard-alert.html` - Standard lead notification

#### 3.2 SMS Templates (`/api/lead-tracking/templates/sms/`)
```javascript
const SMS_TEMPLATES = {
  'immediate-alert-sms': 'URGENT: Emergency lead on {{pageName}}. Score: {{score}}. Phone: {{phoneNumber}}. View: {{dashboardUrl}}',
  'high-priority-sms': 'High-priority lead detected. Score: {{score}}. Check dashboard: {{dashboardUrl}}'
};
```

### Phase 4: Environment Configuration

#### 4.1 Required Environment Variables
```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_MESSAGING_SERVICE_SID=optional_for_better_deliverability

# AWS SES Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=alerts@marfinetzplumbing.org
AWS_SES_FROM_NAME=Marfinetz Plumbing Alerts

# Recipient Configuration
EMERGENCY_PHONE_NUMBERS=+1234567890,+0987654321
EMERGENCY_EMAILS=owner@marfinetzplumbing.org,manager@marfinetzplumbing.org
HIGH_PRIORITY_EMAILS=sales@marfinetzplumbing.org
STANDARD_EMAILS=leads@marfinetzplumbing.org

# Notification Settings
NOTIFICATION_ENABLED=true
NOTIFICATION_RATE_LIMIT_PER_HOUR=50
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY_MS=5000

# Dashboard URL for links in notifications
DASHBOARD_URL=https://marfinetzplumbing.org/dashboard
```

### Phase 5: Rate Limiting and Cost Control

#### 5.1 Rate Limiter Implementation
```javascript
class RateLimiter {
  constructor() {
    this.limits = {
      sms: { perHour: 20, perDay: 100 },
      email: { perHour: 100, perDay: 1000 }
    };
    this.usage = new Map();
  }
  
  async canSend(channel, recipient) {
    // Check rate limits
    // Return boolean
  }
  
  async recordUsage(channel, recipient) {
    // Track usage for rate limiting
  }
}
```

### Phase 6: Error Handling and Retry Logic

#### 6.1 Retry Queue Implementation
```javascript
class RetryQueue {
  async addToQueue(notification) {
    // Add failed notification to retry queue
  }
  
  async processQueue() {
    // Process retry queue with exponential backoff
  }
}
```

### Phase 7: Monitoring and Logging

#### 7.1 Notification Audit Log
```javascript
class NotificationAuditLogger {
  async logNotification(data) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      leadId: data.leadId,
      score: data.score,
      alertType: data.alertType,
      channel: data.channel,
      recipient: data.recipient,
      status: data.status,
      error: data.error || null,
      retryCount: data.retryCount || 0
    };
    
    // Log to file/database
    // Send to monitoring service if configured
  }
}
```

## Integration Steps

### Step 1: Update Main API Handler
```javascript
// In /api/lead-tracking/index.js
app.post('/track', async (req, res) => {
  try {
    // ... existing validation ...
    
    // Calculate real score
    const leadScore = leadScoringService.calculateScore(sessionData);
    
    // Store lead data (implement database storage)
    const leadId = await leadStorageService.store({
      ...req.body,
      calculatedScore: leadScore,
      timestamp: new Date()
    });
    
    // Check if notification should be sent
    const alertType = alertThresholdService.getAlertType(leadScore);
    
    if (alertType && process.env.NOTIFICATION_ENABLED === 'true') {
      // Send notification asynchronously
      notificationService.sendNotification({
        leadId,
        score: leadScore,
        sessionData,
        pageUrl: req.body.pageUrl,
        alertType
      }).catch(error => {
        console.error('Notification error:', error);
        // Don't fail the request if notification fails
      });
    }
    
    res.json({
      success: true,
      leadScore,
      leadId,
      message: 'Lead data tracked successfully'
    });
  } catch (error) {
    // ... error handling ...
  }
});
```

## Testing Strategy

### 1. Unit Tests
- Test scoring algorithm with various event combinations
- Test notification service with mocked Twilio/AWS clients
- Test rate limiter logic
- Test retry queue behavior

### 2. Integration Tests
- Test actual SMS sending with test numbers
- Test actual email sending with test addresses
- Test rate limiting with rapid requests
- Test retry behavior with simulated failures

### 3. Load Tests
- Simulate high-volume lead generation
- Verify rate limiting prevents excessive notifications
- Monitor notification queue performance

### 4. Manual Testing Checklist
- [ ] Emergency lead (score 80+) triggers immediate SMS and email
- [ ] High-priority lead (score 60-79) triggers email only
- [ ] Standard lead (score 40-59) triggers email to sales team
- [ ] Low-score leads (< 40) trigger no notifications
- [ ] Rate limiting prevents notification spam
- [ ] Failed notifications are retried appropriately
- [ ] All notifications are logged for audit

## Security Considerations

1. **API Keys**: Store all API keys in environment variables, never in code
2. **Input Validation**: Validate all phone numbers and email addresses
3. **Rate Limiting**: Implement per-IP rate limiting to prevent abuse
4. **Encryption**: Use TLS for all external API calls
5. **Access Control**: Limit notification sending to authenticated API requests
6. **PII Handling**: Minimize personal information in logs
7. **Audit Trail**: Maintain secure audit logs for compliance

## Monitoring and Alerts

1. **CloudWatch/Datadog Integration**
   - Track notification success/failure rates
   - Monitor API response times
   - Alert on high failure rates

2. **Cost Monitoring**
   - Track Twilio SMS costs
   - Monitor AWS SES email volume
   - Set up billing alerts

3. **Performance Metrics**
   - Notification delivery time
   - Queue processing time
   - API endpoint response time

## Rollout Plan

### Week 1: Development
- Implement core notification service
- Create email/SMS templates
- Set up test environments

### Week 2: Testing
- Unit and integration testing
- Load testing
- Security review

### Week 3: Staging Deployment
- Deploy to staging environment
- Test with real phone numbers/emails
- Monitor for issues

### Week 4: Production Deployment
- Gradual rollout (10% → 50% → 100%)
- Monitor metrics closely
- Have rollback plan ready

## Estimated Costs

### Monthly Estimates (based on 1000 leads/month)
- **Twilio SMS**: ~$50-100 (depending on volume)
- **AWS SES**: ~$1-5 (very low cost)
- **Monitoring**: ~$20-50 (if using paid service)
- **Total**: ~$71-155/month

## Next Steps

1. Review and approve this plan
2. Set up Twilio and AWS accounts
3. Configure environment variables in Railway
4. Begin implementation following the phases outlined
5. Set up monitoring before go-live
6. Create runbook for operations team

## Success Criteria

- Notifications sent within 30 seconds of lead generation
- 99% delivery rate for notifications
- Zero duplicate notifications
- Complete audit trail for all notifications
- Cost per lead under $0.15
- No impact on API response time (< 200ms)