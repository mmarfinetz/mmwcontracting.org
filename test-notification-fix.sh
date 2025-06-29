#!/bin/bash

# Test script for verifying email notification fix
# Tests various email scenarios including missing and invalid emails

API_URL="https://mmwcontractingorg-production.up.railway.app"
echo "========================================="
echo "Email Notification Fix Test"
echo "API URL: $API_URL"
echo "========================================="
echo ""
echo "Wait for Railway deployment to complete (usually 2-3 minutes)"
echo "Press Enter when ready to test..."
read

echo "[TEST 1] Testing with missing email address..."
curl -X POST "$API_URL/api/lead-tracking/track" \
  -H "Content-Type: application/json" \
  -d '{
    "pageName": "Emergency Service",
    "leadScore": 95,
    "scoreFactors": ["Urgent timing", "Emergency service page"],
    "sessionData": {
      "name": "Test User No Email",
      "phone": "(555) 123-4567",
      "location": "123 Test St",
      "urgency": "emergency",
      "problem": "Major water leak in basement",
      "property_type": "residential",
      "preferred_contact": "phone",
      "duration": 180,
      "pageViews": 5,
      "deviceType": "mobile",
      "scoreBreakdown": {
        "behavior": 30,
        "time": 35,
        "intent": 30
      }
    }
  }' | jq .

echo ""
echo "[TEST 2] Testing with invalid email (no domain)..."
curl -X POST "$API_URL/api/lead-tracking/track" \
  -H "Content-Type: application/json" \
  -d '{
    "pageName": "Emergency Service",
    "leadScore": 90,
    "scoreFactors": ["High urgency", "Same day service"],
    "sessionData": {
      "name": "Test User Invalid Email",
      "email": "testuser@",
      "phone": "(555) 234-5678",
      "location": "456 Test Ave",
      "urgency": "same_day",
      "problem": "Toilet overflow",
      "property_type": "commercial",
      "preferred_contact": "email",
      "duration": 240,
      "pageViews": 7,
      "deviceType": "desktop",
      "scoreBreakdown": {
        "behavior": 25,
        "time": 35,
        "intent": 30
      }
    }
  }' | jq .

echo ""
echo "[TEST 3] Testing with valid email address..."
curl -X POST "$API_URL/api/lead-tracking/track" \
  -H "Content-Type: application/json" \
  -d '{
    "pageName": "Water Heater Repair",
    "leadScore": 85,
    "scoreFactors": ["Extended engagement", "Service page visit"],
    "sessionData": {
      "name": "Test User Valid Email",
      "email": "validuser@example.com",
      "phone": "(555) 345-6789",
      "location": "789 Test Blvd",
      "urgency": "this_week",
      "problem": "Water heater making strange noises",
      "property_type": "residential",
      "preferred_contact": "text",
      "duration": 300,
      "pageViews": 6,
      "deviceType": "tablet",
      "scoreBreakdown": {
        "behavior": 30,
        "time": 25,
        "intent": 30
      }
    }
  }' | jq .

echo ""
echo "[TEST 4] Check notification stats..."
curl "$API_URL/api/lead-tracking/stats/notifications" | jq .

echo ""
echo "========================================="
echo "Test complete. Check the stats above."
echo "If notifications are working correctly:"
echo "- No 'Missing final @domain' errors"
echo "- Failed count should not increase"
echo "- You should receive email notifications"
echo "========================================="