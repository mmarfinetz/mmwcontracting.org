# API Testing Guide - Lead Notifications

This guide explains how to test the Marfinetz Plumbing lead tracking API and trigger notifications.

## Test Scripts

### 1. `test-api-notification.sh` - Interactive Testing
A comprehensive test script with menu-driven interface for testing various API endpoints.

#### Usage:
```bash
# Interactive mode (recommended)
./test-api-notification.sh

# Command line mode
./test-api-notification.sh emergency    # Test high-priority lead
./test-api-notification.sh same_day    # Test medium-priority lead
./test-api-notification.sh regular     # Test low-priority lead
./test-api-notification.sh health      # Check API health
./test-api-notification.sh stats       # Get notification stats
./test-api-notification.sh all         # Run all tests
```

#### Environment Variables:
```bash
# Set custom API URL (default: Railway production)
export API_URL="https://mmwcontractingorg-production.up.railway.app"

# Set test token for notification endpoint
export API_TEST_TOKEN="your-test-token-here"
```

### 2. `test-api-parallel.sh` - Stress Testing
Tests the notification system with multiple simultaneous lead submissions.

#### Usage:
```bash
# Run with defaults (5 parallel requests)
./test-api-parallel.sh

# Customize parallel requests
export NUM_PARALLEL=10
export DELAY_BETWEEN=0.5
./test-api-parallel.sh
```

## Quick Start

1. **Test a single high-priority lead:**
   ```bash
   ./test-api-notification.sh emergency
   ```

2. **Run interactive testing:**
   ```bash
   ./test-api-notification.sh
   # Then select option 1 for emergency lead
   ```

3. **Stress test with multiple leads:**
   ```bash
   ./test-api-parallel.sh
   ```

## What Triggers Notifications?

The API uses a lead scoring system. Notifications are triggered when:
- Score >= 80: Immediate notification
- Score >= 60: High priority notification  
- Score >= 40: Standard notification

High scores are achieved by:
- Emergency urgency selections
- After-hours submissions
- Multiple page views
- Form engagement
- Emergency keyword searches

## Monitoring

After running tests, check:
1. Railway logs for API responses
2. Notification stats endpoint
3. Email/SMS delivery (if configured)

## Troubleshooting

If notifications aren't being sent:
1. Check if `NOTIFICATION_ENABLED=true` in Railway environment
2. Verify Twilio/email credentials are configured
3. Check Railway logs for errors
4. Use stats endpoint to see notification history