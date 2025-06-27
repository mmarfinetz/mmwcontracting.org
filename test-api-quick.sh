#!/bin/bash

# Quick API testing script
API_URL="${API_URL:-https://mmwcontractingorg-production.up.railway.app}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Testing Lead Tracking API at: $API_URL"
echo "========================================"

# Test 1: Health Check
echo -e "\n${YELLOW}Test 1: Health Check${NC}"
curl -s -w "\nHTTP Status: %{http_code}\n" "$API_URL/" | jq '.' 2>/dev/null || cat

# Test 2: Basic Tracking
echo -e "\n${YELLOW}Test 2: Basic Tracking${NC}"
curl -s -X POST "$API_URL/track" \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: test-$(date +%s)" \
  -d '{
    "pageUrl": "https://test.example.com",
    "timestamp": '$(date +%s000)',
    "sessionData": {
      "id": "test-'$(date +%s)'",
      "score": 50,
      "events": [{"type": "pageView", "timestamp": '$(date +%s000)'}]
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" | jq '.' 2>/dev/null || cat

# Test 3: Emergency Lead
echo -e "\n${YELLOW}Test 3: Emergency Lead (High Score)${NC}"
curl -s -X POST "$API_URL/track" \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: emergency-$(date +%s)" \
  -d '{
    "pageUrl": "https://test.example.com/emergency",
    "timestamp": '$(date +%s000)',
    "sessionData": {
      "id": "emergency-'$(date +%s)'",
      "score": 0,
      "events": [
        {"type": "emergencyClick", "data": {"points": 30}},
        {"type": "phoneClick", "data": {"points": 25}},
        {"type": "timeOnSite2Min", "data": {"points": 15}}
      ]
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" | jq '.' 2>/dev/null || cat

# Test 4: CORS Headers
echo -e "\n${YELLOW}Test 4: CORS Headers${NC}"
curl -s -I -X OPTIONS "$API_URL/track" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,X-Session-ID" | grep -i "access-control"

echo -e "\n${GREEN}Testing Complete!${NC}"