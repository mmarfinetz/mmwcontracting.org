#!/usr/bin/env node

/**
 * Comprehensive Test Suite for MMW Contracting
 * 
 * This script consolidates all tests for the application including:
 * - Google Places API integration
 * - Lead tracking API functionality
 * - Notification system
 * - AWS SES email sending
 * - Form submission tracking
 * 
 * Usage:
 *   node test-suite.js                    # Run all tests
 *   node test-suite.js --category google  # Run only Google Places API tests
 *   node test-suite.js --category api     # Run only API tests
 *   node test-suite.js --category email   # Run only email/notification tests
 */

const https = require('https');
const http = require('http');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: './api/lead-tracking/.env' });

// Parse command line arguments
const args = process.argv.slice(2);
const categoryIndex = args.indexOf('--category');
const testCategory = categoryIndex !== -1 ? args[categoryIndex + 1] : 'all';

// Test configuration
const config = {
  googleApiKey: process.env.GOOGLE_PLACES_API_KEY,
  apiUrl: process.env.API_URL || 'https://mmwcontractingorg-production.up.railway.app',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsSesFromEmail: process.env.AWS_SES_FROM_EMAIL || 'mitchmarfinetz@gmail.com',
  notificationEnabled: process.env.NOTIFICATION_ENABLED || 'false'
};

// Color utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const color = type === 'success' ? colors.green : 
                type === 'error' ? colors.red : 
                type === 'warning' ? colors.yellow : 
                type === 'header' ? colors.blue :
                colors.cyan;
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function makeHttpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.url || `${config.apiUrl}${options.path}`);
    const client = url.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + (url.search || ''),
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = client.request(requestOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test result tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

function recordTest(name, passed, message = '') {
  testResults.tests.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// ========== GOOGLE PLACES API TESTS ==========
async function testGooglePlacesAPI() {
  log('\n========== GOOGLE PLACES API TESTS ==========', 'header');
  
  if (!config.googleApiKey) {
    log('Google Places API key not found in .env.local file', 'error');
    recordTest('Google Places API Configuration', false, 'API key not configured');
    return;
  }
  
  // Test 1: Basic API functionality
  log('Testing basic Places API functionality...', 'info');
  try {
    const simpleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=38.9072,-77.0369&radius=1000&key=${config.googleApiKey}`;
    const response = await makeHttpRequest({ url: simpleUrl });
    const data = JSON.parse(response.body);
    
    if (data.status === 'OK') {
      log('✓ Basic Places API request successful', 'success');
      recordTest('Basic Places API Request', true);
    } else {
      log(`✗ Basic Places API request failed: ${data.status}`, 'error');
      recordTest('Basic Places API Request', false, data.error_message);
    }
  } catch (error) {
    log(`✗ Basic Places API request error: ${error.message}`, 'error');
    recordTest('Basic Places API Request', false, error.message);
  }
  
  // Test 2: Find Marfinetz Plumbing by name
  log('\nSearching for Marfinetz Plumbing...', 'info');
  try {
    const searchQuery = 'Marfinetz Plumbing Lake City, PA';
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${config.googleApiKey}`;
    
    const response = await makeHttpRequest({ url: searchUrl });
    const data = JSON.parse(response.body);
    
    if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
      const place = data.candidates[0];
      log(`✓ Found business: ${place.name}`, 'success');
      log(`  Address: ${place.formatted_address}`, 'info');
      log(`  Place ID: ${place.place_id}`, 'info');
      recordTest('Find Business by Name', true);
      
      // Test getting reviews for this place
      await testPlaceReviews(place.place_id);
    } else {
      log('✗ Could not find Marfinetz Plumbing', 'error');
      recordTest('Find Business by Name', false, 'Business not found');
    }
  } catch (error) {
    log(`✗ Search error: ${error.message}`, 'error');
    recordTest('Find Business by Name', false, error.message);
  }
}

async function testPlaceReviews(placeId) {
  log('\nTesting place reviews retrieval...', 'info');
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${config.googleApiKey}`;
    const response = await makeHttpRequest({ url: detailsUrl });
    const data = JSON.parse(response.body);
    
    if (data.status === 'OK') {
      const result = data.result;
      if (result.reviews && result.reviews.length > 0) {
        log(`✓ Found ${result.reviews.length} reviews`, 'success');
        log(`  Rating: ${result.rating}/5`, 'info');
        recordTest('Retrieve Business Reviews', true);
      } else {
        log('⚠ No reviews found for this business', 'warning');
        recordTest('Retrieve Business Reviews', true, 'No reviews available');
      }
    } else {
      log(`✗ Failed to get place details: ${data.status}`, 'error');
      recordTest('Retrieve Business Reviews', false, data.error_message);
    }
  } catch (error) {
    log(`✗ Reviews retrieval error: ${error.message}`, 'error');
    recordTest('Retrieve Business Reviews', false, error.message);
  }
}

// ========== LEAD TRACKING API TESTS ==========
async function testLeadTrackingAPI() {
  log('\n========== LEAD TRACKING API TESTS ==========', 'header');
  
  // Test 1: Health Check
  log('Testing API health check...', 'info');
  try {
    const response = await makeHttpRequest({ path: '/' });
    if (response.status === 200) {
      const data = JSON.parse(response.body);
      log(`✓ Health check passed: ${data.service} v${data.version}`, 'success');
      recordTest('API Health Check', true);
    } else {
      log(`✗ Health check failed: HTTP ${response.status}`, 'error');
      recordTest('API Health Check', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    log(`✗ Health check error: ${error.message}`, 'error');
    recordTest('API Health Check', false, error.message);
  }
  
  // Test 2: Tracking Endpoint
  log('\nTesting tracking endpoint...', 'info');
  const testData = {
    pageUrl: 'https://test.example.com',
    referrer: 'https://google.com',
    timestamp: Date.now(),
    sessionData: {
      id: `test-${Date.now()}`,
      score: 75,
      events: [
        { type: 'pageView', timestamp: Date.now() },
        { type: 'emergencyClick', timestamp: Date.now() }
      ],
      pageViews: [
        { url: 'https://test.example.com', timestamp: Date.now() }
      ]
    },
    userAgent: 'Test Suite',
    screenResolution: '1920x1080',
    language: 'en-US',
    timezone: 'America/New_York'
  };
  
  try {
    const response = await makeHttpRequest({
      path: '/track',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': testData.sessionData.id
      }
    }, testData);
    
    if (response.status === 200) {
      const data = JSON.parse(response.body);
      log(`✓ Tracking endpoint successful: Lead score ${data.leadScore}`, 'success');
      recordTest('Tracking Endpoint', true);
    } else {
      log(`✗ Tracking endpoint failed: HTTP ${response.status}`, 'error');
      recordTest('Tracking Endpoint', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    log(`✗ Tracking endpoint error: ${error.message}`, 'error');
    recordTest('Tracking Endpoint', false, error.message);
  }
  
  // Test 3: Score Calculation
  log('\nTesting lead score calculation...', 'info');
  const scoreScenarios = [
    {
      name: 'Emergency Lead',
      sessionData: {
        id: `emergency-${Date.now()}`,
        events: [
          { type: 'emergencyClick', data: { points: 30 } },
          { type: 'phoneClick', data: { points: 25 } }
        ]
      },
      expectedMinScore: 50
    },
    {
      name: 'Normal Browse',
      sessionData: {
        id: `browse-${Date.now()}`,
        events: [{ type: 'pageView', data: {} }]
      },
      expectedMaxScore: 20
    }
  ];
  
  let scoreTestsPassed = true;
  for (const scenario of scoreScenarios) {
    try {
      const response = await makeHttpRequest({
        path: '/track',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        pageUrl: 'https://test.example.com',
        timestamp: Date.now(),
        sessionData: scenario.sessionData
      });
      
      if (response.status === 200) {
        const data = JSON.parse(response.body);
        const score = data.leadScore || 0;
        
        if ((scenario.expectedMinScore && score >= scenario.expectedMinScore) ||
            (scenario.expectedMaxScore && score <= scenario.expectedMaxScore)) {
          log(`✓ ${scenario.name}: Score ${score} meets expectations`, 'success');
        } else {
          log(`✗ ${scenario.name}: Score ${score} outside expected range`, 'error');
          scoreTestsPassed = false;
        }
      } else {
        scoreTestsPassed = false;
      }
    } catch (error) {
      scoreTestsPassed = false;
    }
  }
  recordTest('Lead Score Calculation', scoreTestsPassed);
  
  // Test 4: CORS Configuration
  log('\nTesting CORS configuration...', 'info');
  try {
    const response = await makeHttpRequest({
      path: '/track',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,X-Session-ID'
      }
    });
    
    const corsHeaders = response.headers['access-control-allow-origin'];
    if (corsHeaders) {
      log('✓ CORS is properly configured', 'success');
      recordTest('CORS Configuration', true);
    } else {
      log('✗ CORS headers not found', 'error');
      recordTest('CORS Configuration', false, 'Missing CORS headers');
    }
  } catch (error) {
    log(`✗ CORS test error: ${error.message}`, 'error');
    recordTest('CORS Configuration', false, error.message);
  }
}

// ========== EMAIL & NOTIFICATION TESTS ==========
async function testEmailNotifications() {
  log('\n========== EMAIL & NOTIFICATION TESTS ==========', 'header');
  
  // Test 1: AWS SES Configuration
  log('Testing AWS SES configuration...', 'info');
  const sesConfigured = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
  if (sesConfigured) {
    log('✓ AWS SES credentials are configured', 'success');
    recordTest('AWS SES Configuration', true);
    
    // Only test actual email sending if explicitly enabled
    if (process.env.TEST_EMAIL_SENDING === 'true') {
      await testSESEmailSending();
    } else {
      log('ℹ Skipping actual email sending (set TEST_EMAIL_SENDING=true to enable)', 'info');
    }
  } else {
    log('✗ AWS SES credentials not configured', 'error');
    recordTest('AWS SES Configuration', false, 'Missing AWS credentials');
  }
  
  // Test 2: Notification System
  log('\nTesting notification system endpoints...', 'info');
  try {
    // Test notification stats endpoint
    const statsResponse = await makeHttpRequest({ path: '/notifications/stats?hours=1' });
    if (statsResponse.status === 200) {
      log('✓ Notification stats endpoint working', 'success');
      recordTest('Notification Stats Endpoint', true);
    } else {
      log(`✗ Notification stats failed: HTTP ${statsResponse.status}`, 'error');
      recordTest('Notification Stats Endpoint', false, `HTTP ${statsResponse.status}`);
    }
    
    // Test rate limits endpoint
    const rateLimitResponse = await makeHttpRequest({ path: '/notifications/rate-limits' });
    if (rateLimitResponse.status === 200) {
      log('✓ Rate limits endpoint working', 'success');
      recordTest('Rate Limits Endpoint', true);
    } else {
      log(`✗ Rate limits failed: HTTP ${rateLimitResponse.status}`, 'error');
      recordTest('Rate Limits Endpoint', false, `HTTP ${rateLimitResponse.status}`);
    }
  } catch (error) {
    log(`✗ Notification system error: ${error.message}`, 'error');
    recordTest('Notification System', false, error.message);
  }
  
  // Test 3: Form Submission with Notifications
  log('\nTesting form submission tracking...', 'info');
  const formData = {
    pageUrl: '/contact-form',
    referrer: 'https://google.com',
    timestamp: new Date().toISOString(),
    sessionData: {
      formSubmission: true,
      leadSource: 'contact_form',
      name: 'Test User',
      phone: '814-555-0123',
      email: 'test@example.com',
      urgency: 'normal',
      problem: 'Test submission from comprehensive test suite',
      events: [{ type: 'form_submission', timestamp: Date.now() }]
    }
  };
  
  try {
    const response = await makeHttpRequest({
      path: '/track',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, formData);
    
    if (response.status === 200) {
      const data = JSON.parse(response.body);
      log(`✓ Form submission tracked: Lead score ${data.leadScore}`, 'success');
      recordTest('Form Submission Tracking', true);
    } else {
      log(`✗ Form submission failed: HTTP ${response.status}`, 'error');
      recordTest('Form Submission Tracking', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    log(`✗ Form submission error: ${error.message}`, 'error');
    recordTest('Form Submission Tracking', false, error.message);
  }
}

async function testSESEmailSending() {
  log('\nTesting AWS SES email sending...', 'info');
  try {
    const AWS = require('aws-sdk');
    const ses = new AWS.SES({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: config.awsRegion
    });
    
    const params = {
      Destination: { ToAddresses: ['mitchmarfinetz@gmail.com'] },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: 'Test email from MMW Contracting comprehensive test suite'
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Test Suite - Email Notification Test'
        }
      },
      Source: config.awsSesFromEmail
    };
    
    const result = await ses.sendEmail(params).promise();
    log(`✓ Test email sent successfully: ${result.MessageId}`, 'success');
    recordTest('AWS SES Email Sending', true);
  } catch (error) {
    log(`✗ Email sending failed: ${error.message}`, 'error');
    recordTest('AWS SES Email Sending', false, error.message);
  }
}

// ========== PERFORMANCE TESTS ==========
async function testPerformance() {
  log('\n========== PERFORMANCE TESTS ==========', 'header');
  
  log('Running load test (20 concurrent requests)...', 'info');
  const requestCount = 20;
  const startTime = Date.now();
  const promises = [];
  
  for (let i = 0; i < requestCount; i++) {
    const promise = makeHttpRequest({
      path: '/track',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      pageUrl: 'https://test.example.com',
      timestamp: Date.now(),
      sessionData: { 
        id: `load-test-${i}`, 
        score: Math.floor(Math.random() * 100),
        events: []
      }
    });
    promises.push(promise);
  }
  
  try {
    const results = await Promise.allSettled(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
    const failed = requestCount - successful;
    const avgTime = (duration / requestCount).toFixed(2);
    
    log(`✓ Load test completed in ${duration}ms`, 'success');
    log(`  Successful: ${successful}/${requestCount}`, 'info');
    log(`  Average time: ${avgTime}ms per request`, 'info');
    
    const performancePassed = failed === 0 && avgTime < 1000;
    recordTest('Performance Test', performancePassed, 
      performancePassed ? '' : `${failed} failed requests or slow response (${avgTime}ms avg)`);
  } catch (error) {
    log(`✗ Load test error: ${error.message}`, 'error');
    recordTest('Performance Test', false, error.message);
  }
}

// ========== MAIN TEST RUNNER ==========
async function runTestSuite() {
  console.log(`${colors.bright}${colors.magenta}
╔═══════════════════════════════════════════════════════╗
║     MMW Contracting Comprehensive Test Suite          ║
╚═══════════════════════════════════════════════════════╝${colors.reset}`);
  
  log(`Test Category: ${testCategory.toUpperCase()}`, 'info');
  log(`Environment: ${config.apiUrl}`, 'info');
  log(`Timestamp: ${new Date().toISOString()}`, 'info');
  
  // Run tests based on category
  switch (testCategory.toLowerCase()) {
    case 'google':
      await testGooglePlacesAPI();
      break;
    case 'api':
      await testLeadTrackingAPI();
      await testPerformance();
      break;
    case 'email':
      await testEmailNotifications();
      break;
    case 'all':
    default:
      await testGooglePlacesAPI();
      await testLeadTrackingAPI();
      await testEmailNotifications();
      await testPerformance();
      break;
  }
  
  // Display test summary
  console.log(`\n${colors.bright}${colors.magenta}
╔═══════════════════════════════════════════════════════╗
║                   TEST SUMMARY                        ║
╚═══════════════════════════════════════════════════════╝${colors.reset}`);
  
  testResults.tests.forEach(test => {
    const icon = test.passed ? '✓' : '✗';
    const color = test.passed ? colors.green : colors.red;
    const message = test.message ? ` (${test.message})` : '';
    console.log(`${color}${icon} ${test.name}${message}${colors.reset}`);
  });
  
  console.log(`\n${colors.bright}Total Tests: ${testResults.tests.length}${colors.reset}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  
  const allPassed = testResults.failed === 0;
  const exitCode = allPassed ? 0 : 1;
  
  if (allPassed) {
    console.log(`\n${colors.bright}${colors.green}✓ All tests passed!${colors.reset}`);
  } else {
    console.log(`\n${colors.bright}${colors.red}✗ Some tests failed. Please check the logs above.${colors.reset}`);
  }
  
  // Helpful tips
  console.log(`\n${colors.cyan}Tips:${colors.reset}`);
  console.log('• Run specific test categories: node test-suite.js --category [google|api|email]');
  console.log('• Enable actual email sending: TEST_EMAIL_SENDING=true node test-suite.js');
  console.log('• Check .env.local and api/lead-tracking/.env for configuration');
  
  process.exit(exitCode);
}

// Check for required dependencies
async function checkDependencies() {
  const requiredModules = ['dotenv'];
  const optionalModules = ['aws-sdk', 'axios', 'node-fetch'];
  
  for (const module of requiredModules) {
    try {
      require.resolve(module);
    } catch (e) {
      console.error(`${colors.red}Error: Required module '${module}' is not installed.${colors.reset}`);
      console.error(`Run: npm install ${module}`);
      process.exit(1);
    }
  }
  
  for (const module of optionalModules) {
    try {
      require.resolve(module);
    } catch (e) {
      console.warn(`${colors.yellow}Warning: Optional module '${module}' is not installed.${colors.reset}`);
      console.warn(`Some tests may be skipped. Install with: npm install ${module}`);
    }
  }
}

// Run the test suite
checkDependencies().then(() => {
  runTestSuite().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    console.error(error.stack);
    process.exit(1);
  });
});