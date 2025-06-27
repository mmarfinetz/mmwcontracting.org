# Lead Tracking System Test Guide

## Overview
The lead tracking system consists of:
- **Frontend**: JavaScript tracker (`js/lead-tracker.js`) that monitors user behavior
- **Backend**: Express API deployed to Railway that receives tracking data
- **Form Integration**: Lead capture form (`js/lead-capture.js`) with n8n webhook

## Test File
Open `test-lead-tracking.html` in your browser to access the comprehensive test suite.

## Testing Steps

### 1. Backend API Testing
Since your API is deployed and healthy at `https://api.marfinetzplumbing.org`:

1. **Health Check**
   - Click "Test API Health" button
   - Should return: `{"status":"healthy","service":"Lead Tracking API","version":"1.0.0"}`

2. **Tracking Endpoint**
   - Click "Test Tracking Endpoint" button
   - Should return success with a lead score

### 2. Frontend Tracking Testing

The lead tracker automatically:
- Assigns a unique session ID
- Tracks page views
- Monitors user interactions
- Calculates lead scores based on behavior

**Scoring System:**
- Emergency click: +30 points
- Phone click: +25 points
- Form engagement: +20 points
- After hours visit: +20 points
- Weekend visit: +10 points
- 2+ minutes on site: +15 points
- 3+ page views: +10 points
- Return visitor: +15 points

**Test Behaviors:**
1. Click "Simulate Emergency Click" - adds 30 points
2. Click "Simulate Phone Click" - adds 25 points
3. Click "Simulate Form Start" - adds 20 points
4. Check time-based scoring for current time

**Alert Triggers:**
- Score 80+: Immediate alert
- Score 60-79: High priority
- Score 40-59: Standard priority

### 3. Integration Testing

Click "Run Integration Test" to verify:
- API connectivity
- Lead tracker initialization
- Event tracking functionality
- Score calculation
- Data transmission to backend

### 4. Manual Testing

Test real interactions:
1. Click the phone number link
2. Focus on form inputs
3. Click the emergency button
4. Navigate between pages (if multiple pages exist)

### 5. Load Testing

Test API performance:
1. Set number of requests (default: 10)
2. Click "Run Load Test"
3. Review response times and success rates

## Debug Panel

The floating debug panel shows real-time:
- Session ID
- Current lead score
- Page view count
- Events tracked
- Time on site
- API connection status

## Production Testing

To test on the live site:
1. Open browser developer console
2. Look for "Lead Tracker Event:" logs (if debug mode enabled)
3. Monitor network tab for POST requests to `/track` endpoint
4. Check that tracking occurs invisibly without affecting user experience

## Troubleshooting

### API Connection Issues
- Check CORS settings match frontend domain
- Verify API is running on Railway
- Check environment variables are set correctly

### Tracking Not Working
- Ensure `lead-tracker.js` is loaded on all pages
- Check browser console for errors
- Verify session storage is enabled

### Form Submission Issues
- Check n8n webhook URL is correct
- Verify CORS allows form domain
- Test webhook separately with curl/Postman

## Security Considerations

The test file is for development/testing only. In production:
- Remove debug mode
- Don't expose API keys or sensitive data
- Use HTTPS for all endpoints
- Implement rate limiting
- Add authentication for sensitive endpoints