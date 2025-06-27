#!/usr/bin/env node

/**
 * Notification System Test Suite
 * 
 * This script tests the lead tracking notification system functionality.
 * Run with: node test-notification-system.js
 */

const axios = require('axios');
require('dotenv').config({ path: './api/lead-tracking/.env' });

// API Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const API_TEST_TOKEN = process.env.API_TEST_TOKEN || 'test-token-123';

// Test scenarios
const testScenarios = [
  {
    name: 'Emergency Lead (Score 85+)',
    description: 'Should trigger immediate SMS and email notifications',
    data: {
      pageUrl: 'https://marfinetzplumbing.org/emergency-plumbing',
      referrer: 'https://google.com/search?q=emergency+plumber+near+me',
      timestamp: new Date().toISOString(),
      sessionData: {
        events: [
          { type: 'click', target: 'tel:+1234567890', timestamp: Date.now() },
          { type: 'click', target: 'emergency-service-button', timestamp: Date.now() - 5000 },
          { type: 'page_view', page: '/emergency', timestamp: Date.now() - 10000 }
        ],
        duration: 180000, // 3 minutes
        pageViews: 4,
        pages: ['/emergency', '/contact', '/services/burst-pipe', '/testimonials'],
        isReturning: false,
        deviceType: 'mobile'
      },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      screenResolution: '375x812',
      language: 'en-US',
      timezone: 'America/New_York'
    },
    expectedScore: { min: 80, max: 100 }
  },
  {
    name: 'High Priority Lead (Score 60-79)',
    description: 'Should trigger email notification only',
    data: {
      pageUrl: 'https://marfinetzplumbing.org/services/water-heater',
      referrer: 'https://google.com/search?q=water+heater+replacement',
      timestamp: new Date().toISOString(),
      sessionData: {
        events: [
          { type: 'form_start', form: 'contact-form', timestamp: Date.now() },
          { type: 'page_view', page: '/pricing', timestamp: Date.now() - 30000 },
          { type: 'page_view', page: '/about', timestamp: Date.now() - 60000 }
        ],
        duration: 240000, // 4 minutes
        pageViews: 5,
        pages: ['/services', '/water-heater', '/pricing', '/about', '/contact'],
        isReturning: true,
        deviceType: 'desktop'
      },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
      screenResolution: '1920x1080',
      language: 'en-US',
      timezone: 'America/New_York'
    },
    expectedScore: { min: 60, max: 79 }
  },
  {
    name: 'Standard Lead (Score 40-59)',
    description: 'Should trigger standard email notification',
    data: {
      pageUrl: 'https://marfinetzplumbing.org/services',
      referrer: 'https://facebook.com',
      timestamp: new Date().toISOString(),
      sessionData: {
        events: [
          { type: 'page_view', page: '/services', timestamp: Date.now() },
          { type: 'page_view', page: '/testimonials', timestamp: Date.now() - 45000 }
        ],
        duration: 90000, // 1.5 minutes
        pageViews: 2,
        pages: ['/services', '/testimonials'],
        isReturning: false,
        deviceType: 'tablet'
      },
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X)',
      screenResolution: '1024x768',
      language: 'en-US',
      timezone: 'America/New_York'
    },
    expectedScore: { min: 40, max: 59 }
  },
  {
    name: 'Low Score Lead (Score < 40)',
    description: 'Should NOT trigger any notifications',
    data: {
      pageUrl: 'https://marfinetzplumbing.org/',
      referrer: '',
      timestamp: new Date().toISOString(),
      sessionData: {
        events: [
          { type: 'page_view', page: '/', timestamp: Date.now() }
        ],
        duration: 15000, // 15 seconds
        pageViews: 1,
        pages: ['/'],
        isReturning: false,
        deviceType: 'desktop'
      },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
      screenResolution: '1920x1080',
      language: 'en-US',
      timezone: 'America/New_York'
    },
    expectedScore: { min: 0, max: 39 }
  },
  {
    name: 'Late Night Emergency (Score 90+)',
    description: 'Late night visit with emergency signals - highest priority',
    data: {
      pageUrl: 'https://marfinetzplumbing.org/24-hour-emergency',
      referrer: 'https://google.com/search?q=24+hour+emergency+plumber',
      timestamp: new Date().toISOString(),
      sessionData: {
        events: [
          { type: 'click', target: 'emergency-call-now', timestamp: Date.now() },
          { type: 'click', target: 'tel:+1234567890', timestamp: Date.now() - 2000 },
          { type: 'page_view', page: '/emergency', timestamp: Date.now() - 5000 }
        ],
        duration: 60000, // 1 minute
        pageViews: 2,
        pages: ['/24-hour-emergency', '/emergency'],
        isReturning: false,
        deviceType: 'mobile',
        // Simulate late night timestamp
        timestamp: new Date().setHours(2, 30, 0, 0) // 2:30 AM
      },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      screenResolution: '375x812',
      language: 'en-US',
      timezone: 'America/New_York'
    },
    expectedScore: { min: 90, max: 100 }
  }
];

// Helper functions
function colorize(text, color) {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
  };
  return `${colors[color]}${text}${colors.reset}`;
}

async function testLeadTracking(scenario) {
  console.log(`\n${colorize('Testing:', 'blue')} ${scenario.name}`);
  console.log(`${colorize('Description:', 'yellow')} ${scenario.description}`);
  
  try {
    // Send lead tracking data
    const response = await axios.post(`${API_BASE_URL}/track`, scenario.data);
    
    // Check response
    if (response.data.success) {
      const score = response.data.leadScore;
      console.log(`${colorize('✓ Success:', 'green')} Lead tracked successfully`);
      console.log(`  Lead ID: ${response.data.leadId}`);
      console.log(`  Score: ${score}`);
      console.log(`  Factors: ${response.data.scoreFactors?.join(', ') || 'None'}`);
      
      // Verify score is in expected range
      if (score >= scenario.expectedScore.min && score <= scenario.expectedScore.max) {
        console.log(`${colorize('✓ Score Validation:', 'green')} Score ${score} is within expected range [${scenario.expectedScore.min}-${scenario.expectedScore.max}]`);
      } else {
        console.log(`${colorize('✗ Score Validation:', 'red')} Score ${score} is outside expected range [${scenario.expectedScore.min}-${scenario.expectedScore.max}]`);
      }
    } else {
      console.log(`${colorize('✗ Failed:', 'red')} ${response.data.error}`);
    }
  } catch (error) {
    console.log(`${colorize('✗ Error:', 'red')} ${error.response?.data?.error || error.message}`);
  }
}

async function testNotificationEndpoints() {
  console.log(`\n${colorize('=== Testing Notification Management Endpoints ===', 'blue')}\n`);
  
  // Test notification stats
  try {
    console.log(`${colorize('Testing:', 'yellow')} GET /notifications/stats`);
    const statsResponse = await axios.get(`${API_BASE_URL}/notifications/stats?hours=1`);
    console.log(`${colorize('✓ Stats Response:', 'green')}`);
    console.log(JSON.stringify(statsResponse.data, null, 2));
  } catch (error) {
    console.log(`${colorize('✗ Stats Error:', 'red')} ${error.message}`);
  }
  
  // Test rate limits
  try {
    console.log(`\n${colorize('Testing:', 'yellow')} GET /notifications/rate-limits`);
    const rateLimitResponse = await axios.get(`${API_BASE_URL}/notifications/rate-limits`);
    console.log(`${colorize('✓ Rate Limits Response:', 'green')}`);
    console.log(JSON.stringify(rateLimitResponse.data, null, 2));
  } catch (error) {
    console.log(`${colorize('✗ Rate Limits Error:', 'red')} ${error.message}`);
  }
  
  // Test retry queue
  try {
    console.log(`\n${colorize('Testing:', 'yellow')} GET /notifications/retry-queue`);
    const retryQueueResponse = await axios.get(`${API_BASE_URL}/notifications/retry-queue`);
    console.log(`${colorize('✓ Retry Queue Response:', 'green')}`);
    console.log(JSON.stringify(retryQueueResponse.data, null, 2));
  } catch (error) {
    console.log(`${colorize('✗ Retry Queue Error:', 'red')} ${error.message}`);
  }
  
  // Test notification sending (requires auth token)
  if (API_TEST_TOKEN) {
    try {
      console.log(`\n${colorize('Testing:', 'yellow')} POST /notifications/test`);
      const testNotificationResponse = await axios.post(
        `${API_BASE_URL}/notifications/test`,
        { score: 85, channel: 'email' },
        { headers: { Authorization: `Bearer ${API_TEST_TOKEN}` } }
      );
      console.log(`${colorize('✓ Test Notification Response:', 'green')}`);
      console.log(JSON.stringify(testNotificationResponse.data, null, 2));
    } catch (error) {
      console.log(`${colorize('✗ Test Notification Error:', 'red')} ${error.response?.data?.error || error.message}`);
    }
  }
}

async function runTests() {
  console.log(colorize('=== Lead Tracking Notification System Test Suite ===', 'blue'));
  console.log(`API URL: ${API_BASE_URL}`);
  console.log(`Notification Enabled: ${process.env.NOTIFICATION_ENABLED || 'false'}`);
  console.log(`Time: ${new Date().toISOString()}\n`);
  
  // Check if API is running
  try {
    const healthCheck = await axios.get(`${API_BASE_URL}/`);
    console.log(`${colorize('✓ API Health Check:', 'green')} ${healthCheck.data.service} v${healthCheck.data.version}`);
  } catch (error) {
    console.log(`${colorize('✗ API Connection Failed:', 'red')} Make sure the API is running on ${API_BASE_URL}`);
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
  
  // Run lead tracking tests
  console.log(`\n${colorize('=== Testing Lead Tracking Scenarios ===', 'blue')}`);
  for (const scenario of testScenarios) {
    await testLeadTracking(scenario);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Run notification endpoint tests
  await testNotificationEndpoints();
  
  console.log(`\n${colorize('=== Test Suite Complete ===', 'blue')}\n`);
}

// Check if axios is installed
try {
  require.resolve('axios');
} catch (e) {
  console.error(`${colorize('Error:', 'red')} axios is not installed. Run: npm install axios`);
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  console.error(`${colorize('Fatal Error:', 'red')}`, error);
  process.exit(1);
});