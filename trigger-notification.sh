#!/bin/bash

# Quick script to trigger a lead notification
# Usage: ./trigger-notification.sh

API_URL="${API_URL:-https://mmwcontractingorg-production.up.railway.app}"

echo "🚨 Triggering high-priority lead notification..."
echo ""

# Submit an emergency lead that will score high
curl -X POST "${API_URL}/track" \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: quick-test-$(date +%s)" \
  -d '{
    "pageUrl": "/contact-form",
    "referrer": "https://google.com/search?q=emergency+plumber+burst+pipe",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
    "screenResolution": "390x844",
    "language": "en-US", 
    "timezone": "America/New_York",
    "sessionData": {
      "formSubmission": true,
      "leadSource": "contact_form",
      "name": "John Emergency",
      "phone": "814-555-9999",
      "email": "emergency@test.com",
      "property_type": "residential",
      "location": "123 Flood St, Erie, PA 16501",
      "urgency": "emergency",
      "problem": "EMERGENCY! Burst pipe flooding basement! Need help immediately!",
      "preferred_contact": "phone",
      "events": [
        {"type": "emergencyClick", "timestamp": '$(date +%s)000'},
        {"type": "phoneClick", "timestamp": '$(date +%s)000'},
        {"type": "contactFormStart", "timestamp": '$(date +%s)000'},
        {"type": "form_submission", "timestamp": '$(date +%s)000'}
      ],
      "duration": 180000,
      "pageViews": 5,
      "score": 90
    }
  }' | jq '.' 2>/dev/null || cat

echo ""
echo "✅ Notification request sent!"
echo "Check Railway logs for notification delivery status."