# Lead Tracking API Test Results

## Test Setup

I've created an enhanced test suite that can test the lead tracking API in different configurations:

1. **test-lead-tracking-enhanced.html** - Enhanced test suite with configurable endpoints
2. **test-lead-tracking.html** - Original test suite (also available)

## Current API Status

The API endpoint `https://api.marfinetzplumbing.org` is not resolving (DNS not configured). The API appears to be deployed on Railway but needs:

1. A custom domain configured in Railway
2. OR use the Railway-provided URL directly

## Testing Instructions

### Option 1: Test with Railway URL

1. Open `test-lead-tracking-enhanced.html` in your browser
2. Select "Railway URL" radio button
3. Enter your Railway app URL (e.g., `https://your-app.railway.app`)
4. The test suite will automatically test connectivity

### Option 2: Test Locally

1. Start the API locally:
   ```bash
   cd api/lead-tracking
   npm install
   npm start
   ```

2. Open `test-lead-tracking-enhanced.html` in your browser
3. Select "Local Development" radio button
4. The test suite will use `http://localhost:3001`

## Test Suite Features

### 1. API Configuration
- Switch between production, Railway, and local endpoints
- Real-time endpoint switching without page reload
- Automatic health check on endpoint change

### 2. Enhanced Debug Panel
- Live session tracking
- Real-time lead score updates
- Recent events display
- API connection status

### 3. Comprehensive Tests
- **API Health Check** - Tests the root endpoint
- **Tracking Endpoint** - Tests POST to /track
- **CORS Configuration** - Verifies cross-origin settings
- **Behavior Simulation** - Tests all scoring scenarios
- **Integration Tests** - End-to-end validation
- **Load Testing** - Performance under concurrent requests

### 4. Visual Feedback
- Color-coded test results (green=pass, red=fail, orange=warning)
- Timestamped logs
- Real-time event tracking
- Score progression visualization

## Next Steps

To fully test the API:

1. **Get the Railway URL**: 
   - Log into Railway dashboard
   - Find your deployed service
   - Copy the public URL

2. **Configure Custom Domain** (optional):
   - In Railway, generate a domain or add custom domain
   - Update DNS records to point `api.marfinetzplumbing.org` to Railway

3. **Update Frontend**:
   - Once you have the working API URL
   - Update `js/lead-tracker.js` line 11 with the correct endpoint

## Troubleshooting

### API Not Responding
- Check if the Railway app is running (view logs in Railway dashboard)
- Verify environment variables are set in Railway
- Ensure MongoDB connection is working

### CORS Errors
- The API needs to allow the origin where the test is running
- For local testing, may need to add `localhost` to allowed origins
- Check the CORS test in the test suite for current configuration

### Tracking Not Working
- Verify the lead tracker is initialized (check debug panel)
- Look for console errors in browser developer tools
- Ensure the API endpoint is correctly configured

## Test Scenarios

The test suite validates:

1. **High-Value Actions** (Emergency situations)
   - Emergency clicks: +30 points
   - Triggers immediate alerts at 80+ points

2. **Contact Intent** (Sales opportunities)
   - Phone clicks: +25 points
   - Form engagement: +20 points

3. **Engagement Metrics** (Interest indicators)
   - Time on site >2 min: +15 points
   - 3+ page views: +10 points

4. **Time-Based Scoring** (Urgency indicators)
   - After hours (before 8am/after 6pm): +20 points
   - Weekend visits: +10 points
   - Business hours: +5 points

5. **Return Visitors**
   - Returning visitor: +15 points

## Alert Thresholds

- **80+ points**: Immediate alert (hot lead)
- **60-79 points**: High priority
- **40-59 points**: Standard priority
- **<40 points**: Monitor

## Performance Metrics

The load test helps determine:
- API response time under load
- Concurrent request handling
- Failure rate at scale
- Average processing time per request

Use this data to optimize the API and set appropriate rate limits.