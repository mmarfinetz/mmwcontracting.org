#!/bin/bash

# Marfinetz Plumbing API Lead Notification Test Script
# This script tests the API and triggers lead notifications

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
API_URL="${API_URL:-https://mmwcontractingorg-production.up.railway.app}"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to generate a high-scoring lead submission
generate_high_score_lead() {
    local urgency="${1:-emergency}"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat <<EOF
{
  "pageUrl": "/contact-form",
  "referrer": "https://google.com/search?q=emergency+plumber+near+me",
  "timestamp": "${timestamp}",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "screenResolution": "1920x1080",
  "language": "en-US",
  "timezone": "America/New_York",
  "sessionData": {
    "formSubmission": true,
    "leadSource": "contact_form",
    "name": "Test Customer - ${urgency}",
    "phone": "814-555-0123",
    "email": "test@example.com",
    "property_type": "residential",
    "location": "123 Test St, Erie, PA",
    "urgency": "${urgency}",
    "problem": "URGENT: Water leak in basement, flooding rapidly!",
    "preferred_contact": "phone",
    "events": [
      { "type": "emergencyClick", "timestamp": $(date +%s)000 },
      { "type": "phoneClick", "timestamp": $(date +%s)000 },
      { "type": "contactFormStart", "timestamp": $(date +%s)000 },
      { "type": "form_submission", "timestamp": $(date +%s)000 }
    ],
    "duration": 180000,
    "pageViews": 5,
    "score": 85,
    "visitor": {
      "device": "desktop",
      "referrer": "google.com"
    }
  }
}
EOF
}

# Function to test the main tracking endpoint
test_tracking_endpoint() {
    local urgency="${1:-emergency}"
    print_info "Testing tracking endpoint with ${urgency} lead..."
    
    local payload=$(generate_high_score_lead "$urgency")
    
    # Save payload for debugging
    echo "$payload" > /tmp/test-payload.json
    print_info "Payload saved to /tmp/test-payload.json"
    
    # Send the request
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "X-Session-ID: test-session-$(date +%s)" \
        -d "$payload" \
        "${API_URL}/track")
    
    # Extract status code and body
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        print_success "Lead submitted successfully (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        
        # Check if notification should have been triggered
        if echo "$body" | grep -q '"leadScore":[8-9][0-9]\|"leadScore":100'; then
            print_warning "High score detected - notification should have been triggered!"
        fi
    else
        print_error "Failed to submit lead (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    
    echo ""
}

# Function to test the notification test endpoint
test_notification_endpoint() {
    local score="${1:-85}"
    print_info "Testing notification endpoint with score: $score"
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "{\"score\": $score}" \
        "${API_URL}/notifications/test")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        print_success "Test notification sent successfully (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "Failed to send test notification (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    
    echo ""
}

# Function to check API health
check_api_health() {
    print_info "Checking API health..."
    
    response=$(curl -s -w "\n%{http_code}" "${API_URL}/")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        print_success "API is healthy"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "API health check failed (HTTP $http_code)"
        echo "$body"
        exit 1
    fi
    
    echo ""
}

# Function to get notification stats
get_notification_stats() {
    print_info "Getting notification stats..."
    
    response=$(curl -s -w "\n%{http_code}" "${API_URL}/notifications/stats?hours=24")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        print_success "Retrieved notification stats"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_warning "Could not retrieve notification stats (HTTP $http_code)"
    fi
    
    echo ""
}

# Main menu
show_menu() {
    echo "=================================="
    echo "Lead Notification Test Script"
    echo "API URL: $API_URL"
    echo "=================================="
    echo "1. Test Emergency Lead (High Score)"
    echo "2. Test Same-Day Lead (Medium Score)"
    echo "3. Test Regular Lead (Low Score)"
    echo "4. Test Notification Endpoint"
    echo "5. Check API Health"
    echo "6. Get Notification Stats"
    echo "7. Run All Tests"
    echo "8. Exit"
    echo "=================================="
}

# Main script
main() {
    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed. Please install curl."
        exit 1
    fi
    
    # Check if jq is installed (optional, for pretty JSON)
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed. JSON output will not be formatted."
    fi
    
    # Interactive mode
    if [ $# -eq 0 ]; then
        while true; do
            show_menu
            read -p "Select an option (1-8): " choice
            echo ""
            
            case $choice in
                1)
                    test_tracking_endpoint "emergency"
                    ;;
                2)
                    test_tracking_endpoint "same_day"
                    ;;
                3)
                    test_tracking_endpoint "flexible"
                    ;;
                4)
                    read -p "Enter test score (0-100) [85]: " score
                    score=${score:-85}
                    test_notification_endpoint "$score"
                    ;;
                5)
                    check_api_health
                    ;;
                6)
                    get_notification_stats
                    ;;
                7)
                    check_api_health
                    test_tracking_endpoint "emergency"
                    test_tracking_endpoint "same_day"
                    test_tracking_endpoint "flexible"
                    test_notification_endpoint 85
                    get_notification_stats
                    ;;
                8)
                    print_info "Exiting..."
                    exit 0
                    ;;
                *)
                    print_error "Invalid option. Please select 1-8."
                    ;;
            esac
            
            read -p "Press Enter to continue..."
            echo ""
        done
    else
        # Command line mode
        case "$1" in
            emergency|high)
                test_tracking_endpoint "emergency"
                ;;
            same_day|medium)
                test_tracking_endpoint "same_day"
                ;;
            regular|low)
                test_tracking_endpoint "flexible"
                ;;
            notify|notification)
                score="${2:-85}"
                test_notification_endpoint "$score"
                ;;
            health)
                check_api_health
                ;;
            stats)
                get_notification_stats
                ;;
            all)
                check_api_health
                test_tracking_endpoint "emergency"
                test_tracking_endpoint "same_day"
                test_tracking_endpoint "flexible"
                test_notification_endpoint 85
                get_notification_stats
                ;;
            *)
                echo "Usage: $0 [command]"
                echo ""
                echo "Commands:"
                echo "  emergency    - Test emergency lead (high score)"
                echo "  same_day     - Test same-day lead (medium score)"
                echo "  regular      - Test regular lead (low score)"
                echo "  notify [score] - Test notification endpoint"
                echo "  health       - Check API health"
                echo "  stats        - Get notification stats"
                echo "  all          - Run all tests"
                echo ""
                echo "Environment variables:"
                echo "  API_URL      - API base URL (default: https://mmwcontractingorg-production.up.railway.app)"
                exit 1
                ;;
        esac
    fi
}

# Run main function
main "$@"