// Security headers middleware for Express.js servers
// Add this to your server configuration if using Node.js/Express

const securityHeaders = (req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  // Configured to allow necessary functionality while preventing eval()
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "frame-src 'self' https://forms.gle https://docs.google.com; " +
    "connect-src 'self' https://mmwcontractingorg-production.up.railway.app http://localhost:* http://127.0.0.1:*; " +
    "object-src 'none';"
  );
  
  // CORS headers for API endpoints
  if (req.path.startsWith('/api/')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-ID');
  }
  
  next();
};

module.exports = securityHeaders;

// Usage in your Express app:
// const securityHeaders = require('./server-headers');
// app.use(securityHeaders);