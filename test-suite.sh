#!/bin/bash

# Comprehensive Test Suite for MMW Contracting (Shell Script Version)
# 
# This script provides quick command-line testing for API endpoints
# Use test-suite.js for more comprehensive testing with detailed reports
#
# Usage:
#   ./test-suite.sh              # Run all tests
#   ./test-suite.sh health       # Check API health only
#   ./test-suite.sh track        # Test tracking endpoints
#   ./test-suite.sh notify       # Test notification system
#   ./test-suite.sh emergency    # Submit emergency lead test

# Configuration
API_URL="${API_URL:-https://mmwcontractingorg-production.up.railway.app}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BRIGHT='\033[1m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
print_header() {
    echo -e "\n${BRIGHT}${MAGENTA}=== $1 ===${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓ [SUCCESS]${NC} $1"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}✗ [ERROR]${NC} $1"
    ((TESTS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ [WARNING]${NC} $1"
}

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    command -v curl &> /dev/null || missing_deps+=("curl")
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        echo "Please install missing dependencies before running tests."
        exit 1
    fi
    
    # Check optional dependencies
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed. JSON output will not be formatted."
    fi
}

# API Health Check
test_health() {
    print_header "API Health Check"
    
    response=$(curl -s -w "\n%{http_code}" "$API_URL/")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        print_success "API is healthy (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "API health check failed (HTTP $http_code)"
        echo "$body"
        return 1
    fi
}

# Test Tracking Endpoint
test_tracking() {
    print_header "Tracking Endpoint Tests"
    
    # Basic tracking test
    print_info "Testing basic tracking..."
    
    payload='{
        "pageUrl": "https://test.example.com",
        "timestamp": '$(date +%s000)',
        "sessionData": {
            "id": "test-'$(date +%s)'",
            "score": 50,
            "events": [{"type": "pageView", "timestamp": '$(date +%s000)'}]
        },
        "userAgent": "Test Suite Shell Script",
        "screenResolution": "1920x1080"
    }'
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "X-Session-ID: test-$(date +%s)" \
        -d "$payload" \
        "$API_URL/track")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        print_success "Basic tracking successful"
        echo "$body" | jq '.leadScore' 2>/dev/null && score=$(echo "$body" | jq -r '.leadScore' 2>/dev/null)
        [ -n "$score" ] && print_info "Lead score: $score"
    else
        print_error "Basic tracking failed (HTTP $http_code)"
    fi
}

# Test Emergency Lead Submission
test_emergency_lead() {
    print_header "Emergency Lead Test"
    
    print_info "Submitting high-priority emergency lead..."
    
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    payload='{
        "pageUrl": "/contact-form",
        "referrer": "https://google.com/search?q=emergency+plumber",
        "timestamp": "'$timestamp'",
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
        "screenResolution": "375x812",
        "language": "en-US",
        "timezone": "America/New_York",
        "sessionData": {
            "formSubmission": true,
            "leadSource": "contact_form",
            "name": "Emergency Test - Shell Script",
            "phone": "814-555-0911",
            "email": "emergency@test.com",
            "property_type": "residential",
            "location": "123 Emergency St, Erie, PA",
            "urgency": "emergency",
            "problem": "URGENT: Major water leak, flooding basement!",
            "preferred_contact": "phone",
            "events": [
                {"type": "emergencyClick", "timestamp": '$(date +%s000)'},
                {"type": "phoneClick", "timestamp": '$(date +%s000)'},
                {"type": "form_submission", "timestamp": '$(date +%s000)'}
            ],
            "duration": 45000,
            "pageViews": 3
        }
    }'
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "X-Session-ID: emergency-$(date +%s)" \
        -d "$payload" \
        "$API_URL/track")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        print_success "Emergency lead submitted successfully"
        score=$(echo "$body" | jq -r '.leadScore' 2>/dev/null || echo "N/A")
        print_info "Lead score: $score (should be 80+)"
        
        if [ "$score" -ge 80 ] 2>/dev/null; then
            print_warning "High-priority notification should have been triggered!"
        fi
    else
        print_error "Emergency lead submission failed (HTTP $http_code)"
    fi
}

# Test Notification System
test_notifications() {
    print_header "Notification System Tests"
    
    # Test notification stats
    print_info "Getting notification statistics..."
    
    response=$(curl -s -w "\n%{http_code}" "$API_URL/notifications/stats?hours=24")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        print_success "Retrieved notification stats"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "Failed to get notification stats (HTTP $http_code)"
    fi
    
    # Test rate limits
    print_info "Checking rate limits..."
    
    response=$(curl -s -w "\n%{http_code}" "$API_URL/notifications/rate-limits")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
        print_success "Retrieved rate limit information"
    else
        print_error "Failed to get rate limits (HTTP $http_code)"
    fi
}

# Test CORS Configuration
test_cors() {
    print_header "CORS Configuration Test"
    
    response=$(curl -s -I -X OPTIONS "$API_URL/track" \
        -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,X-Session-ID")
    
    if echo "$response" | grep -qi "access-control-allow-origin"; then
        print_success "CORS headers are properly configured"
        echo "$response" | grep -i "access-control" | sed 's/^/  /'
    else
        print_error "CORS headers not found"
    fi
}

# Performance Test
test_performance() {
    print_header "Performance Test"
    
    print_info "Running 10 concurrent requests..."
    
    start_time=$(date +%s)
    
    # Run 10 requests in background
    for i in {1..10}; do
        (
            curl -s -X POST "$API_URL/track" \
                -H "Content-Type: application/json" \
                -d '{
                    "pageUrl": "https://test.example.com",
                    "timestamp": '$(date +%s000)',
                    "sessionData": {"id": "perf-test-'$i'", "events": []}
                }' > /dev/null 2>&1
        ) &
    done
    
    # Wait for all background jobs
    wait
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    if [ $duration -lt 5 ]; then
        print_success "Performance test completed in ${duration}s"
    else
        print_warning "Performance test took ${duration}s (expected < 5s)"
    fi
}

# Show test summary
show_summary() {
    print_header "Test Summary"
    
    total_tests=$((TESTS_PASSED + TESTS_FAILED))
    
    echo -e "${BRIGHT}Total Tests: $total_tests${NC}"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n${BRIGHT}${GREEN}✓ All tests passed!${NC}"
        return 0
    else
        echo -e "\n${BRIGHT}${RED}✗ Some tests failed. Please check the logs above.${NC}"
        return 1
    fi
}

# Main function
main() {
    echo -e "${BRIGHT}${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${BRIGHT}${CYAN}║     MMW Contracting Test Suite (Shell Version)        ║${NC}"
    echo -e "${BRIGHT}${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo -e "API URL: $API_URL"
    echo -e "Time: $(date)"
    
    check_dependencies
    
    case "${1:-all}" in
        health)
            test_health
            ;;
        track|tracking)
            test_health && test_tracking
            ;;
        emergency)
            test_health && test_emergency_lead
            ;;
        notify|notifications)
            test_health && test_notifications
            ;;
        cors)
            test_cors
            ;;
        perf|performance)
            test_health && test_performance
            ;;
        all)
            test_health
            test_tracking
            test_emergency_lead
            test_notifications
            test_cors
            test_performance
            ;;
        *)
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  health       - Check API health"
            echo "  track        - Test tracking endpoints"
            echo "  emergency    - Submit emergency lead test"
            echo "  notify       - Test notification system"
            echo "  cors         - Test CORS configuration"
            echo "  performance  - Run performance tests"
            echo "  all          - Run all tests (default)"
            echo ""
            echo "Environment variables:"
            echo "  API_URL      - API base URL (default: https://mmwcontractingorg-production.up.railway.app)"
            exit 1
            ;;
    esac
    
    echo ""
    show_summary
}

# Run main function
main "$@"