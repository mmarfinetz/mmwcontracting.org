# Railway Environment Variables - Complete List

## Critical Issue Found
The API was failing with HTTP 500 errors due to:
1. A ReferenceError in index.js where `alertType` was used before being defined (now fixed)
2. Missing AWS and Twilio credentials causing the notification service to fail

## Required Environment Variables for Railway

### Core Configuration
```bash
# Port (Railway provides this automatically)
PORT=3001

# Node environment
NODE_ENV=production

# Frontend URL for CORS
FRONTEND_URL=https://marfinetzplumbing.org

# Dashboard URL for notification links
DASHBOARD_URL=https://marfinetzplumbing.org/dashboard
```

### Notification System
```bash
# Enable notifications (must be exactly "true" to enable)
NOTIFICATION_ENABLED=true

# Test API token for the /notifications/test endpoint
API_TEST_TOKEN=your-secure-test-token-here
```

### Email Recipients
```bash
# Emergency notifications (score 80-100)
EMERGENCY_EMAILS=admin@marfinetzplumbing.org,mmarfinetz@gmail.com,mitchmarfinetz@gmail.com

# High priority notifications (score 60-79)
HIGH_PRIORITY_EMAILS=admin@marfinetzplumbing.org,mmarfinetz@gmail.com,mitchmarfinetz@gmail.com

# Standard notifications (score 40-59)
STANDARD_EMAILS=admin@marfinetzplumbing.org
```

### SMS Recipients
```bash
# Phone numbers must include country code (e.g., +1 for US)
EMERGENCY_PHONE_NUMBERS=+18142736315
HIGH_PRIORITY_PHONE_NUMBERS=+18142736315
STANDARD_PHONE_NUMBERS=+18142736315
```

### AWS SES Configuration (Required for Email)
```bash
# AWS credentials for SES
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# SES sender configuration
AWS_SES_FROM_EMAIL=noreply@marfinetzplumbing.org
AWS_SES_FROM_NAME=Marfinetz Plumbing Lead Alerts
```

### Twilio Configuration (Required for SMS)
```bash
# Twilio credentials
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_NUMBER=+1234567890  # Your Twilio phone number
```

### Optional: MongoDB (Currently not used)
```bash
# If you want to enable database storage
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lead-tracking
```

## Important Notes

1. **Without AWS credentials**: Email notifications will be disabled
2. **Without Twilio credentials**: SMS notifications will be disabled
3. **Without any credentials**: All notifications will fail silently, but the API will still accept and log leads
4. **NOTIFICATION_ENABLED must be exactly "true"**: Any other value (including "TRUE" or "1") will disable notifications

## Testing After Deployment

1. Check API health:
   ```bash
   curl https://mmwcontractingorg-production.up.railway.app/
   ```

2. Test with the script:
   ```bash
   # Set the test token first
   export API_TEST_TOKEN=your-secure-test-token-here
   
   # Run emergency test (should trigger notifications)
   ./test-api-notification.sh emergency
   ```

3. Check notification stats:
   ```bash
   curl https://mmwcontractingorg-production.up.railway.app/notifications/stats?hours=24
   ```

## Verification Checklist

- [ ] All environment variables are set in Railway
- [ ] AWS SES is configured and sender email is verified
- [ ] Twilio account is active with a phone number
- [ ] Test token is set and secure
- [ ] CORS includes your frontend domain
- [ ] Recipients are configured for each alert level