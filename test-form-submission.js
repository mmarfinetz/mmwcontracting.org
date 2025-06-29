// Test script to verify form submission tracking and email notifications
const fetch = require('node-fetch');

// Test form submission data
const formSubmission = {
  pageUrl: '/contact-form',
  referrer: 'https://google.com',
  timestamp: new Date().toISOString(),
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  screenResolution: '1920x1080',
  language: 'en-US',
  timezone: 'America/New_York',
  sessionData: {
    formSubmission: true,
    leadSource: 'contact_form',
    name: 'John Smith',
    phone: '814-555-0123',
    email: 'john.smith@example.com',
    property_type: 'residential',
    location: '123 Main St, State College, PA 16801',
    urgency: 'emergency',
    problem: 'Major water leak in basement! Water is flooding the floor and I need immediate assistance. The main shutoff valve seems to be stuck.',
    preferred_contact: 'phone',
    events: [
      { type: 'form_submission', timestamp: Date.now() }
    ],
    duration: 45,
    pageViews: 3,
    deviceType: 'desktop',
    referrer: 'https://google.com',
    scoreBreakdown: {
      behavior: 30,
      time: 25,
      intent: 35,
      bonuses: 10
    }
  }
};

// API endpoint
const API_URL = 'https://mmwcontractingorg-production.up.railway.app/track';

// Function to test form submission
async function testFormSubmission() {
  console.log('🧪 Testing form submission with lead tracking...\n');
  console.log('📋 Form Data:');
  console.log(`   Name: ${formSubmission.sessionData.name}`);
  console.log(`   Phone: ${formSubmission.sessionData.phone}`);
  console.log(`   Email: ${formSubmission.sessionData.email}`);
  console.log(`   Property: ${formSubmission.sessionData.property_type}`);
  console.log(`   Address: ${formSubmission.sessionData.location}`);
  console.log(`   Urgency: ${formSubmission.sessionData.urgency}`);
  console.log(`   Problem: ${formSubmission.sessionData.problem}`);
  console.log(`   Preferred Contact: ${formSubmission.sessionData.preferred_contact}`);
  console.log('\n📡 Sending to API...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formSubmission)
    });

    const responseText = await response.text();
    console.log(`Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('\n✅ Form submission tracked successfully!');
      console.log(`   Lead ID: ${result.leadId}`);
      console.log(`   Lead Score: ${result.leadScore}/100`);
      console.log(`   Score Factors:`, result.scoreFactors);
      console.log('\n📧 Email notification should be sent with all form details.');
      console.log('\n⚡ Check your email for the lead notification with:');
      console.log('   - Complete contact information');
      console.log('   - Problem description');
      console.log('   - Urgency level highlighted');
      console.log('   - Clickable phone and email links');
    } else {
      console.error('\n❌ Error:', responseText);
    }
  } catch (error) {
    console.error('\n❌ Failed to submit form:', error.message);
  }
}

// Run the test
testFormSubmission();