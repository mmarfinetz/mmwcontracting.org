# Lead Tracking System Deployment Guide

## Overview

This guide covers the deployment of the invisible lead tracking and alert system for Marfinetz Plumbing.

## System Components

1. **Frontend Tracking Script** (`/js/lead-tracker.js`)
   - Automatically loaded on all pages
   - Tracks visitor behavior without cookies
   - Sends data to backend API

2. **Backend API** (`/api/lead-tracking/`)
   - Collects and processes visitor data
   - Calculates lead scores
   - Dispatches alerts via SMS/Email

3. **Monitoring Dashboard** (`/app/dashboard/`)
   - Real-time visitor analytics
   - Lead scoring visualization
   - Alert history

## Deployment Steps

### Phase 1: Infrastructure Setup (Week 1-2)

1. **Set up API hosting**
   ```bash
   # Option 1: Deploy to AWS Lambda
   # Option 2: Deploy to dedicated server
   # Option 3: Use existing Next.js API routes
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Add Twilio credentials for SMS
   - Add AWS SES credentials for email
   - Add Anthropic API key for AI analysis

3. **Set up database**
   - MongoDB or PostgreSQL recommended
   - Create indexes for session queries

4. **Deploy tracking script**
   - Already added to index.html
   - Will start collecting data immediately

### Phase 2: Alert System (Week 3-4)

1. **Configure Twilio**
   - Create Twilio account
   - Get phone number
   - Add credentials to .env

2. **Configure AWS SES**
   - Verify email domain
   - Create email templates
   - Add credentials to .env

3. **Test alert thresholds**
   - Verify immediate alerts (score 80+)
   - Test high priority (score 60+)
   - Check standard alerts (score 40+)

### Phase 3: AI Integration (Week 5-6)

1. **Set up Anthropic API**
   - Add API key to environment
   - Test AI analysis endpoint
   - Monitor API usage

2. **Fine-tune scoring algorithm**
   - Analyze initial data
   - Adjust score weights
   - Optimize alert triggers

## Security Considerations

1. **Data Privacy**
   - No personal data stored
   - IP addresses are hashed
   - 30-day auto-deletion

2. **Rate Limiting**
   - API endpoints are rate-limited
   - DDoS protection enabled

3. **Access Control**
   - Dashboard requires authentication
   - API keys stored securely

## Monitoring & Maintenance

1. **Daily Tasks**
   - Check alert delivery
   - Monitor API errors
   - Review high-value leads

2. **Weekly Tasks**
   - Analyze conversion rates
   - Adjust scoring thresholds
   - Clean up old sessions

3. **Monthly Tasks**
   - Review AI insights accuracy
   - Optimize database queries
   - Update alert templates

## Dashboard Access

The monitoring dashboard is available at:
- Development: http://localhost:3000/dashboard
- Production: https://marfinetzplumbing.org/dashboard

## Troubleshooting

### Common Issues

1. **Alerts not sending**
   - Check Twilio/AWS credentials
   - Verify phone/email formats
   - Check API logs

2. **Tracking not working**
   - Verify script is loading
   - Check browser console
   - Confirm API endpoint

3. **High false positives**
   - Adjust scoring weights
   - Review behavior patterns
   - Update AI prompts

## Performance Metrics

Target metrics:
- Script load time: <100ms
- API response time: <200ms
- Alert delivery: <30 seconds
- Dashboard load: <2 seconds

## Cost Estimates

Monthly costs (estimated):
- Twilio SMS: ~$50-100
- AWS SES: ~$10-20
- Anthropic API: ~$20-50
- Hosting: ~$20-100
- **Total: ~$100-270/month**

## Support

For issues or questions:
- Technical: Review API logs
- Business: Check dashboard metrics
- Urgent: SMS alerts will notify immediately