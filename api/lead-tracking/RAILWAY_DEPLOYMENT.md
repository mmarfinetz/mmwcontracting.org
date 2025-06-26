# Railway Deployment Guide for Lead Tracking API

## Prerequisites

1. Railway account (https://railway.app)
2. MongoDB Atlas account for database (https://mongodb.com/cloud/atlas)
3. Anthropic API key for AI analysis (https://console.anthropic.com)
4. Twilio account for SMS alerts (optional)

## Deployment Steps

### 1. Set up MongoDB Atlas

1. Create a free MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/lead-tracking`)
4. Whitelist Railway's IPs or allow access from anywhere (0.0.0.0/0)

### 2. Deploy to Railway

1. Push your code to GitHub (if not already)

2. In Railway dashboard:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `/api/lead-tracking` directory as the root

3. Railway will automatically detect Node.js and use the configuration in `railway.json`

### 3. Configure Environment Variables

In Railway dashboard, go to your service and add these variables:

```bash
# Required
DATABASE_URL=mongodb+srv://your-connection-string
IP_SALT=generate-a-random-string-here
ANTHROPIC_API_KEY=your-anthropic-api-key

# Optional (for SMS alerts)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
ALERT_PHONE=+18142736315
ALERT_EMAIL=admin@marfinetzplumbing.org
```

### 4. Generate a Domain

1. In Railway service settings, go to "Settings" > "Networking"
2. Click "Generate Domain" to get your API URL
3. Your API will be available at: `https://your-app.railway.app`

### 5. Update Your Frontend

Update your frontend JavaScript (`js/lead-tracker.js`) to use the production API URL:

```javascript
const API_URL = 'https://your-app.railway.app';
```

### 6. Monitor Deployment

- Check logs in Railway dashboard
- The API should start on the PORT provided by Railway (automatically set)
- Test endpoints:
  - `GET https://your-app.railway.app/` (health check)
  - `POST https://your-app.railway.app/track` (lead tracking)

## Troubleshooting

### MongoDB Connection Issues
- Ensure IP whitelist includes Railway (or use 0.0.0.0/0)
- Check connection string format
- Verify database user permissions

### API Not Starting
- Check logs for error messages
- Ensure all required environment variables are set
- Verify Node.js version compatibility (requires >=18.0.0)

### CORS Errors
- The API is configured to accept requests from marfinetzplumbing.org
- For testing, you may need to temporarily add localhost to CORS origins

## Maintenance

### Viewing Logs
```bash
railway logs
```

### Updating the API
Simply push changes to your GitHub repository. Railway will automatically redeploy.

### Scaling
Railway automatically handles scaling. For manual control, adjust settings in the Railway dashboard.

## Costs

- Railway: Free tier includes 500 hours/month and $5 credit
- MongoDB Atlas: Free tier includes 512MB storage
- Anthropic API: Pay per use
- Twilio: Pay per SMS

## Security Notes

1. Never commit `.env` files to Git
2. Use Railway's environment variables for all secrets
3. Regularly rotate API keys
4. Monitor usage to prevent abuse
5. Keep dependencies updated