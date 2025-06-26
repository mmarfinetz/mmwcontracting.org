# Railway Deployment Instructions for MMW Contracting

## Quick Fix for Current Deployment Error

Your Railway deployment is failing because it's looking for the application in the root directory, but your lead tracking API is in `/api/lead-tracking/`.

### Solution Applied

I've created a `railway.json` file in the root directory that tells Railway where to find your application:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd api/lead-tracking && npm install"
  },
  "deploy": {
    "startCommand": "cd api/lead-tracking && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Next Steps

1. **Commit and Push Changes**
   ```bash
   git add railway.json
   git commit -m "Fix Railway deployment configuration"
   git push origin main
   ```

2. **In Railway Dashboard**
   - Go to your failed deployment
   - Click "Redeploy" or wait for automatic deployment after push
   - The build should now find your Node.js application in `/api/lead-tracking/`

3. **Verify Environment Variables**
   Make sure these are set in Railway:
   - `DATABASE_URL` or `MONGODB_URI` (for MongoDB connection)
   - `ANTHROPIC_API_KEY` (for AI analysis)
   - `IP_SALT` (for security)
   - Any other variables your app needs

### Alternative Solution

If the above doesn't work, you can also:

1. In Railway dashboard, go to your service settings
2. Look for "Root Directory" or "Build Settings"
3. Set the root directory to `/api/lead-tracking`
4. Remove the railway.json from root and use the one in `/api/lead-tracking/`

### Monitoring

After deployment:
- Check the deploy logs for any errors
- Visit your Railway-provided URL to test the API
- Test endpoint: `https://your-app.railway.app/` should return a health check response

### Troubleshooting

If deployment still fails:
1. Check that all npm dependencies are listed in package.json
2. Ensure Node.js version is compatible (>=18.0.0)
3. Verify MongoDB connection string is correct
4. Check Railway logs for specific error messages