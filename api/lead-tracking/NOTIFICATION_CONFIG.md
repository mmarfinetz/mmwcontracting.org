# Email Notification Configuration

## Environment Variables to Add in Railway

Add these environment variables to your Railway deployment:

```bash
# Enable the notification system
NOTIFICATION_ENABLED=true

# Email Recipients (comma-separated for multiple)
EMERGENCY_EMAILS=admin@marfinetzplumbing.org,mmarfinetz@gmail.com,mitchmarfinetz@gmail.com
HIGH_PRIORITY_EMAILS=admin@marfinetzplumbing.org,mmarfinetz@gmail.com,mitchmarfinetz@gmail.com
STANDARD_EMAILS=admin@marfinetzplumbing.org

# Phone Recipients (comma-separated for multiple)
EMERGENCY_PHONE_NUMBERS=+18142736315
HIGH_PRIORITY_PHONE_NUMBERS=+18142736315
STANDARD_PHONE_NUMBERS=+18142736315

# AWS SES Email Configuration
AWS_SES_FROM_EMAIL=noreply@marfinetzplumbing.org
AWS_SES_FROM_NAME=Marfinetz Plumbing Lead Alerts
```

## How Notifications Work

The system automatically sends notifications based on lead scores:

- **Score 80-100 (Emergency)**: 
  - Sends to all emails in `EMERGENCY_EMAILS`
  - Sends SMS to all numbers in `EMERGENCY_PHONE_NUMBERS`
  - Response time: 15 minutes

- **Score 60-79 (High Priority)**:
  - Sends to all emails in `HIGH_PRIORITY_EMAILS`
  - Response time: 2 hours

- **Score 40-59 (Standard)**:
  - Sends to all emails in `STANDARD_EMAILS`
  - Response time: 24 hours

## Adding to Railway

1. Go to your Railway project dashboard
2. Select the lead-tracking service
3. Navigate to the Variables tab
4. Add each environment variable listed above
5. The service will automatically redeploy with the new configuration

## Testing

After deployment, you can test the notifications by submitting a form with:
- "emergency" urgency to trigger score 80+ (immediate notification)
- "same_day" urgency for score 60-79 (high priority)
- "this_week" urgency for score 40-59 (standard)

All three email addresses will receive notifications for emergency and high priority leads.