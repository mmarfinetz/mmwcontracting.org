#!/bin/bash

# Railway Environment Variables Setup Script
# Run this after linking your Railway project

echo "Setting up Railway environment variables..."

# Required variables
railway variables set DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/lead-tracking?retryWrites=true&w=majority"
railway variables set IP_SALT="$(openssl rand -hex 32)"
railway variables set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"

# Optional variables (uncomment and fill if using SMS alerts)
# railway variables set TWILIO_ACCOUNT_SID="your-twilio-sid"
# railway variables set TWILIO_AUTH_TOKEN="your-twilio-auth-token"  
# railway variables set TWILIO_PHONE_NUMBER="+1234567890"
# railway variables set ALERT_PHONE="+18142736315"
# railway variables set ALERT_EMAIL="admin@marfinetzplumbing.org"

echo "Environment variables set!"
echo ""
echo "IMPORTANT: Update the DATABASE_URL with your actual MongoDB connection string"
echo ""
echo "To view all variables: railway variables"
echo "To deploy: railway up"
echo "To get your domain: railway domain"