#!/bin/bash

# Notification System Test Script
# This script tests the lead tracking notification system

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
API_URL="${API_URL:-http://localhost:3001}"
API_TEST_TOKEN="${API_TEST_TOKEN:-test-token-123}"

echo -e "${BLUE}=== Lead Tracking Notification System Test ===${NC}"
echo "API URL: $API_URL"
echo "Time: $(date)"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local auth=$5
    
    echo -e "${YELLOW}Testing:${NC} $description"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        if [ -z "$auth" ]; then
            response=$(curl -s -X GET "$API_URL$endpoint")
        else
            response=$(curl -s -X GET "$API_URL$endpoint" -H "Authorization: Bearer $API_TEST_TOKEN")
        fi
    else
        if [ -z "$auth" ]; then
            response=$(curl -s -X POST "$API_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -X POST "$API_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $API_TEST_TOKEN" \
                -d "$data")
        fi
    fi
    
    # Check if response contains "success":true
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ Success${NC}"
        echo "$response" | python -m json.tool 2>/dev/null || echo "$response"
    else
        echo -e "${RED}✗ Failed${NC}"
        echo "$response" | python -m json.tool 2>/dev/null || echo "$response"
    fi
    echo ""
}

# Check if API is running
echo -e "${YELLOW}Checking API health...${NC}"
health_check=$(curl -s "$API_URL/")
if echo "$health_check" | grep -q '"status":"healthy"'; then
    echo -e "${GREEN}✓ API is healthy${NC}"
    echo ""
else
    echo -e "${RED}✗ API is not responding${NC}"
    echo "Make sure the API is running on $API_URL"
    exit 1
fi

# Test 1: Emergency Lead (High Score)
echo -e "${BLUE}=== Test 1: Emergency Lead ===${NC}"
emergency_data='{
  "pageUrl": "https://marfinetzplumbing.org/emergency-plumbing",
  "referrer": "https://google.com/search?q=emergency+plumber+near+me",
  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "sessionData": {
    "events": [
      {"type": "click", "target": "tel:+1234567890", "timestamp": '$(($(date +%s) * 1000))'},
      {"type": "click", "target": "emergency-service-button", "timestamp": '$(($(date +%s) * 1000 - 5000))'},
      {"type": "page_view", "page": "/emergency", "timestamp": '$(($(date +%s) * 1000 - 10000))'}
    ],
    "duration": 180000,
    "pageViews": 4,
    "pages": ["/emergency", "/contact", "/services/burst-pipe", "/testimonials"],
    "isReturning": false,
    "deviceType": "mobile"
  },
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
  "screenResolution": "375x812",
  "language": "en-US",
  "timezone": "America/New_York"
}'

test_endpoint "POST" "/track" "$emergency_data" "Emergency lead tracking (should score 80+)"

# Test 2: Regular Lead (Medium Score)
echo -e "${BLUE}=== Test 2: Regular Lead ===${NC}"
regular_data='{
  "pageUrl": "https://marfinetzplumbing.org/services",
  "referrer": "https://google.com",
  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "sessionData": {
    "events": [
      {"type": "page_view", "page": "/services", "timestamp": '$(($(date +%s) * 1000))'},
      {"type": "page_view", "page": "/about", "timestamp": '$(($(date +%s) * 1000 - 30000))'}
    ],
    "duration": 120000,
    "pageViews": 3,
    "pages": ["/services", "/about", "/contact"],
    "isReturning": false,
    "deviceType": "desktop"
  },
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "screenResolution": "1920x1080",
  "language": "en-US",
  "timezone": "America/New_York"
}'

test_endpoint "POST" "/track" "$regular_data" "Regular lead tracking (should score 40-70)"

# Test 3: Low Score Lead
echo -e "${BLUE}=== Test 3: Low Score Lead ===${NC}"
low_score_data='{
  "pageUrl": "https://marfinetzplumbing.org/",
  "referrer": "",
  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "sessionData": {
    "events": [
      {"type": "page_view", "page": "/", "timestamp": '$(($(date +%s) * 1000))'}
    ],
    "duration": 15000,
    "pageViews": 1,
    "pages": ["/"],
    "isReturning": false,
    "deviceType": "desktop"
  },
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "screenResolution": "1920x1080",
  "language": "en-US",
  "timezone": "America/New_York"
}'

test_endpoint "POST" "/track" "$low_score_data" "Low engagement lead (should score < 40)"

# Test 4: Notification Stats
echo -e "${BLUE}=== Test 4: Notification Stats ===${NC}"
test_endpoint "GET" "/notifications/stats?hours=1" "" "Get notification statistics (last hour)"

# Test 5: Rate Limits
echo -e "${BLUE}=== Test 5: Rate Limits ===${NC}"
test_endpoint "GET" "/notifications/rate-limits" "" "Get current rate limit status"

# Test 6: Retry Queue
echo -e "${BLUE}=== Test 6: Retry Queue ===${NC}"
test_endpoint "GET" "/notifications/retry-queue" "" "Get retry queue status"

# Test 7: Send Test Notification (requires auth)
if [ ! -z "$API_TEST_TOKEN" ]; then
    echo -e "${BLUE}=== Test 7: Send Test Notification ===${NC}"
    test_notification_data='{
      "score": 85,
      "channel": "email"
    }'
    test_endpoint "POST" "/notifications/test" "$test_notification_data" "Send test notification (requires auth)" "auth"
else
    echo -e "${YELLOW}Skipping test notification (API_TEST_TOKEN not set)${NC}"
fi

echo -e "${BLUE}=== Test Complete ===${NC}"
echo "Note: Check the API logs for detailed notification processing information"