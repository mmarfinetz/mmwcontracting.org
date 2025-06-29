#!/bin/bash

# Parallel API Testing Script
# Runs multiple lead submissions simultaneously to test notification system

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_URL="${API_URL:-https://mmwcontractingorg-production.up.railway.app}"
NUM_PARALLEL="${NUM_PARALLEL:-5}"
DELAY_BETWEEN="${DELAY_BETWEEN:-1}"

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}Parallel Lead Notification Tester${NC}"
echo -e "${BLUE}==================================${NC}"
echo "API URL: $API_URL"
echo "Parallel requests: $NUM_PARALLEL"
echo ""

# Function to submit a lead
submit_lead() {
    local id=$1
    local urgency=$2
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    echo -e "${YELLOW}[Worker-$id]${NC} Submitting $urgency lead..."
    
    # Create unique lead data
    payload=$(cat <<EOF
{
  "pageUrl": "/contact-form",
  "referrer": "https://google.com/search?q=emergency+plumber",
  "timestamp": "${timestamp}",
  "userAgent": "Mozilla/5.0 (Test Worker $id)",
  "screenResolution": "1920x1080",
  "language": "en-US",
  "timezone": "America/New_York",
  "sessionData": {
    "formSubmission": true,
    "leadSource": "contact_form",
    "name": "Test Customer #$id",
    "phone": "814-555-$(printf "%04d" $id)",
    "email": "test$id@example.com",
    "property_type": "residential",
    "location": "$id Main St, Erie, PA",
    "urgency": "$urgency",
    "problem": "Worker $id: Urgent plumbing issue - water everywhere!",
    "preferred_contact": "phone",
    "events": [
      { "type": "emergencyClick", "timestamp": $(date +%s)000 },
      { "type": "phoneClick", "timestamp": $(date +%s)000 },
      { "type": "contactFormStart", "timestamp": $(date +%s)000 },
      { "type": "form_submission", "timestamp": $(date +%s)000 }
    ],
    "duration": 180000,
    "pageViews": 5,
    "score": 85
  }
}
EOF
)
    
    # Submit the request
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "X-Session-ID: parallel-test-$id-$(date +%s)" \
        -d "$payload" \
        "${API_URL}/track" 2>&1)
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}[Worker-$id]${NC} ✓ Lead submitted successfully"
        if echo "$response" | grep -q '"leadScore":[8-9][0-9]\|"leadScore":100'; then
            echo -e "${YELLOW}[Worker-$id]${NC} ⚡ High score - notification triggered!"
        fi
    else
        echo -e "${YELLOW}[Worker-$id]${NC} ✗ Failed: $response"
    fi
}

# Run parallel submissions
echo -e "${BLUE}Starting parallel lead submissions...${NC}"
echo ""

# Launch background jobs
for i in $(seq 1 $NUM_PARALLEL); do
    # Vary urgency types
    case $((i % 3)) in
        0) urgency="emergency" ;;
        1) urgency="same_day" ;;
        2) urgency="this_week" ;;
    esac
    
    submit_lead $i $urgency &
    
    # Small delay between launches
    sleep $DELAY_BETWEEN
done

# Wait for all background jobs to complete
echo ""
echo -e "${BLUE}Waiting for all submissions to complete...${NC}"
wait

echo ""
echo -e "${GREEN}All parallel submissions completed!${NC}"
echo ""

# Get stats after submissions
echo -e "${BLUE}Fetching notification stats...${NC}"
curl -s "${API_URL}/notifications/stats?hours=1" | jq '.' 2>/dev/null || \
    curl -s "${API_URL}/notifications/stats?hours=1"

echo ""
echo -e "${BLUE}==================================${NC}"
echo -e "${GREEN}Parallel testing completed${NC}"
echo -e "${BLUE}==================================${NC}"