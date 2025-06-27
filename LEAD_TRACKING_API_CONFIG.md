# Lead Tracking API Configuration

## Current Setup

The lead tracking system is now configured to use your main domain by default:
- Default endpoint: `https://marfinetzplumbing.org/api/lead-tracking`
- No separate subdomain needed!

## Configuration Options

### Option 1: Direct Railway URL (Simplest)
In your HTML files, add before the lead-tracker.js script:
```html
<script>
  window.LEAD_TRACKING_API_URL = 'https://your-app-name.railway.app';
</script>
<script src="js/lead-tracker.js"></script>
```

### Option 2: Proxy Through Your Domain (Recommended)
Add to your `next.config.js`:
```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/lead-tracking/:path*',
        destination: 'https://your-app-name.railway.app/:path*',
      },
    ]
  },
}
```

Benefits:
- Uses your domain (marfinetzplumbing.org)
- No CORS issues
- Cleaner URLs
- Can change backend without updating frontend

### Option 3: Environment-Based Configuration
Create a config file that loads based on environment:
```javascript
// In your HTML
<script>
  // For production
  window.LEAD_TRACKING_API_URL = 'https://your-railway-app.railway.app';
  
  // For local development
  if (window.location.hostname === 'localhost') {
    window.LEAD_TRACKING_API_URL = 'http://localhost:3001';
  }
</script>
```

## Quick Start

1. Get your Railway app URL from the Railway dashboard
2. Choose one of the options above
3. Update the configuration
4. Test with `test-lead-tracking-enhanced.html`

## No Subdomain Required!

You do NOT need `api.marfinetzplumbing.org`. The system now works with:
- Your Railway URL directly
- OR proxied through marfinetzplumbing.org/api/lead-tracking
- OR any custom configuration you prefer

The `api.marfinetzplumbing.org` was just a placeholder - you can use whatever works best for your setup!