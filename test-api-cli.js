#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration
const API_URL = process.env.API_URL || 'https://mmwcontractingorg-production.up.railway.app';
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Helper functions
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const color = type === 'success' ? colors.green : 
                  type === 'error' ? colors.red : 
                  type === 'warning' ? colors.yellow : 
                  colors.cyan;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const isHttps = options.hostname ? options.hostname.startsWith('https') : API_URL.startsWith('https');
        const client = isHttps ? https : http;
        
        const req = client.request(options, (res) => {
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
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Test functions
async function testHealthCheck() {
    log('Testing API Health Check...', 'info');
    
    try {
        const url = new URL(API_URL);
        const response = await makeRequest({
            hostname: url.hostname,
            port: url.port,
            path: '/',
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.status === 200) {
            const data = JSON.parse(response.body);
            log(`✓ Health Check Passed: ${JSON.stringify(data)}`, 'success');
            return true;
        } else {
            log(`✗ Health Check Failed: HTTP ${response.status}`, 'error');
            return false;
        }
    } catch (error) {
        log(`✗ Health Check Error: ${error.message}`, 'error');
        return false;
    }
}

async function testTrackingEndpoint() {
    log('Testing Tracking Endpoint...', 'info');
    
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
        userAgent: 'CLI Test Script',
        screenResolution: '1920x1080',
        language: 'en-US',
        timezone: 'America/New_York'
    };
    
    try {
        const url = new URL(API_URL);
        const response = await makeRequest({
            hostname: url.hostname,
            port: url.port,
            path: '/track',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': testData.sessionData.id
            }
        }, testData);
        
        if (response.status === 200) {
            const data = JSON.parse(response.body);
            log(`✓ Tracking Endpoint Passed: ${JSON.stringify(data)}`, 'success');
            return true;
        } else {
            log(`✗ Tracking Endpoint Failed: HTTP ${response.status} - ${response.body}`, 'error');
            return false;
        }
    } catch (error) {
        log(`✗ Tracking Endpoint Error: ${error.message}`, 'error');
        return false;
    }
}

async function testScoreCalculation() {
    log('Testing Score Calculation...', 'info');
    
    const scenarios = [
        {
            name: 'Emergency Lead (High Score)',
            sessionData: {
                id: `emergency-${Date.now()}`,
                score: 0,
                events: [
                    { type: 'emergencyClick', data: { points: 30 } },
                    { type: 'phoneClick', data: { points: 25 } },
                    { type: 'timeOnSite2Min', data: { points: 15 } }
                ]
            },
            expectedMinScore: 70
        },
        {
            name: 'Normal Browse (Low Score)',
            sessionData: {
                id: `browse-${Date.now()}`,
                score: 0,
                events: [
                    { type: 'pageView', data: {} }
                ]
            },
            expectedMaxScore: 20
        }
    ];
    
    let allPassed = true;
    
    for (const scenario of scenarios) {
        try {
            const url = new URL(API_URL);
            const response = await makeRequest({
                hostname: url.hostname,
                port: url.port,
                path: '/track',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': scenario.sessionData.id
                }
            }, {
                pageUrl: 'https://test.example.com',
                timestamp: Date.now(),
                sessionData: scenario.sessionData
            });
            
            if (response.status === 200) {
                const data = JSON.parse(response.body);
                const score = data.leadScore || 0;
                
                if (scenario.expectedMinScore && score >= scenario.expectedMinScore) {
                    log(`✓ ${scenario.name}: Score ${score} >= ${scenario.expectedMinScore}`, 'success');
                } else if (scenario.expectedMaxScore && score <= scenario.expectedMaxScore) {
                    log(`✓ ${scenario.name}: Score ${score} <= ${scenario.expectedMaxScore}`, 'success');
                } else {
                    log(`✗ ${scenario.name}: Score ${score} outside expected range`, 'error');
                    allPassed = false;
                }
            } else {
                log(`✗ ${scenario.name}: HTTP ${response.status}`, 'error');
                allPassed = false;
            }
        } catch (error) {
            log(`✗ ${scenario.name}: ${error.message}`, 'error');
            allPassed = false;
        }
    }
    
    return allPassed;
}

async function testCORS() {
    log('Testing CORS Configuration...', 'info');
    
    try {
        const url = new URL(API_URL);
        const response = await makeRequest({
            hostname: url.hostname,
            port: url.port,
            path: '/track',
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,X-Session-ID'
            }
        });
        
        const corsHeaders = {
            'access-control-allow-origin': response.headers['access-control-allow-origin'],
            'access-control-allow-methods': response.headers['access-control-allow-methods'],
            'access-control-allow-headers': response.headers['access-control-allow-headers']
        };
        
        log(`CORS Headers: ${JSON.stringify(corsHeaders, null, 2)}`, 'info');
        
        if (corsHeaders['access-control-allow-origin']) {
            log('✓ CORS is configured', 'success');
            return true;
        } else {
            log('✗ CORS headers not found', 'error');
            return false;
        }
    } catch (error) {
        log(`✗ CORS Test Error: ${error.message}`, 'error');
        return false;
    }
}

async function testLoadPerformance() {
    log('Testing Load Performance...', 'info');
    
    const requestCount = 20;
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < requestCount; i++) {
        const promise = makeRequest({
            hostname: new URL(API_URL).hostname,
            port: new URL(API_URL).port,
            path: '/track',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': `load-test-${i}`
            }
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
        
        log(`Load Test Results:`, 'info');
        log(`  Total Requests: ${requestCount}`, 'info');
        log(`  Successful: ${successful}`, 'success');
        log(`  Failed: ${failed}`, failed > 0 ? 'error' : 'info');
        log(`  Total Time: ${duration}ms`, 'info');
        log(`  Avg Time/Request: ${(duration / requestCount).toFixed(2)}ms`, 'info');
        
        return failed === 0;
    } catch (error) {
        log(`✗ Load Test Error: ${error.message}`, 'error');
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log(`${colors.bright}${colors.blue}=== Lead Tracking API Test Suite ===${colors.reset}`);
    console.log(`API URL: ${API_URL}\n`);
    
    const tests = [
        { name: 'Health Check', fn: testHealthCheck },
        { name: 'Tracking Endpoint', fn: testTrackingEndpoint },
        { name: 'Score Calculation', fn: testScoreCalculation },
        { name: 'CORS Configuration', fn: testCORS },
        { name: 'Load Performance', fn: testLoadPerformance }
    ];
    
    const results = [];
    
    for (const test of tests) {
        console.log(`\n${colors.bright}--- ${test.name} ---${colors.reset}`);
        const passed = await test.fn();
        results.push({ name: test.name, passed });
        
        // Add delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log(`\n${colors.bright}${colors.blue}=== Test Summary ===${colors.reset}`);
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    results.forEach(r => {
        const icon = r.passed ? '✓' : '✗';
        const color = r.passed ? colors.green : colors.red;
        console.log(`${color}${icon} ${r.name}${colors.reset}`);
    });
    
    console.log(`\nTotal: ${passed} passed, ${failed} failed`);
    
    process.exit(failed > 0 ? 1 : 0);
}

// Run tests if called directly
if (require.main === module) {
    runAllTests().catch(error => {
        log(`Fatal error: ${error.message}`, 'error');
        process.exit(1);
    });
}

module.exports = { testHealthCheck, testTrackingEndpoint, testScoreCalculation };