#!/bin/bash

# Install notification system dependencies

echo "Installing notification system dependencies..."

# Core notification libraries
npm install twilio@^4.19.0
npm install aws-sdk@^2.1500.0

# Rate limiting
npm install rate-limiter-flexible@^3.0.0

# Retry queue (optional but recommended)
npm install bull@^4.11.5
npm install ioredis@^5.3.2  # Required for bull

# Email template engine
npm install handlebars@^4.7.8

# Additional utilities
npm install joi@^17.11.0  # For validation
npm install winston@^3.11.0  # For better logging

echo "Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Set up environment variables in .env file"
echo "2. Configure Twilio account at https://www.twilio.com"
echo "3. Configure AWS SES at https://aws.amazon.com/ses/"
echo "4. Update Railway environment variables"