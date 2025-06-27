const fs = require('fs').promises;
const path = require('path');

// Email template configurations
const EMAIL_TEMPLATES = {
  'immediate-alert-email': {
    subject: '🚨 URGENT: Emergency Lead - Immediate Action Required',
    template: 'immediate-alert.html'
  },
  'high-priority-email': {
    subject: '⚡ High-Priority Lead Detected - Score: {{score}}/100',
    template: 'high-priority.html'
  },
  'standard-alert-email': {
    subject: 'New Lead Alert - Score: {{score}}/100',
    template: 'standard-alert.html'
  },
  'test-email': {
    subject: 'Test Notification - Lead Tracking System',
    template: 'test.html'
  }
};

async function getEmailTemplate(templateName, data) {
  const config = EMAIL_TEMPLATES[templateName];
  if (!config) {
    throw new Error(`Email template not found: ${templateName}`);
  }

  // Process subject line
  let subject = config.subject;
  Object.keys(data).forEach(key => {
    subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
  });

  // Load HTML template
  let html;
  try {
    const templatePath = path.join(__dirname, config.template);
    html = await fs.readFile(templatePath, 'utf8');
  } catch (error) {
    // Fallback to inline template if file not found
    html = getInlineTemplate(templateName, data);
  }

  // Replace placeholders in HTML
  Object.keys(data).forEach(key => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
  });

  // Generate plain text version
  const text = generatePlainText(html, data);

  return { subject, html, text };
}

function getInlineTemplate(templateName, data) {
  // Inline templates as fallback
  const templates = {
    'immediate-alert-email': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Emergency Lead Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f5f5f5; padding: 30px; border-radius: 0 0 5px 5px; }
        .alert-box { background-color: #ffebee; border-left: 5px solid #d32f2f; padding: 15px; margin: 20px 0; }
        .score { font-size: 36px; font-weight: bold; color: #d32f2f; }
        .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .cta-button { display: inline-block; background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 EMERGENCY LEAD ALERT</h1>
            <p>Immediate Action Required</p>
        </div>
        <div class="content">
            <div class="alert-box">
                <h2>High-Value Lead Detected</h2>
                <p>A potential customer showing emergency service signals has been identified.</p>
            </div>
            
            <div class="details">
                <h3>Lead Score: <span class="score">{{score}}/100</span></h3>
                <p><strong>Page Visited:</strong> {{pageName}}</p>
                <p><strong>Time:</strong> {{timestamp}}</p>
                <p><strong>Lead ID:</strong> {{leadId}}</p>
                
                <h4>Scoring Factors:</h4>
                <ul>
                    <li>Behavior Score: {{sessionData.scoreBreakdown.behavior}}</li>
                    <li>Timing Score: {{sessionData.scoreBreakdown.time}}</li>
                    <li>Intent Score: {{sessionData.scoreBreakdown.intent}}</li>
                </ul>
                
                <h4>Session Details:</h4>
                <ul>
                    <li>Duration: {{sessionData.duration}} seconds</li>
                    <li>Pages Viewed: {{sessionData.pageViews}}</li>
                    <li>Device: {{sessionData.deviceType}}</li>
                </ul>
            </div>
            
            <center>
                <a href="{{dashboardUrl}}" class="cta-button">View Full Details in Dashboard</a>
            </center>
            
            <div class="alert-box">
                <strong>Recommended Actions:</strong>
                <ol>
                    <li>Call the customer immediately if phone number is available</li>
                    <li>Check the dashboard for complete session details</li>
                    <li>Prepare emergency service options</li>
                    <li>Follow up within 15 minutes</li>
                </ol>
            </div>
        </div>
        <div class="footer">
            <p>This is an automated alert from Marfinetz Plumbing Lead Tracking System</p>
            <p>To adjust notification settings, please contact your administrator</p>
        </div>
    </div>
</body>
</html>`,
    
    'high-priority-email': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>High-Priority Lead Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f57c00; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f5f5f5; padding: 30px; border-radius: 0 0 5px 5px; }
        .alert-box { background-color: #fff3e0; border-left: 5px solid #f57c00; padding: 15px; margin: 20px 0; }
        .score { font-size: 36px; font-weight: bold; color: #f57c00; }
        .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .cta-button { display: inline-block; background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ HIGH-PRIORITY LEAD</h1>
            <p>Quick Follow-up Recommended</p>
        </div>
        <div class="content">
            <div class="alert-box">
                <h2>Quality Lead Identified</h2>
                <p>A potential customer showing strong interest has visited your website.</p>
            </div>
            
            <div class="details">
                <h3>Lead Score: <span class="score">{{score}}/100</span></h3>
                <p><strong>Page Visited:</strong> {{pageName}}</p>
                <p><strong>Time:</strong> {{timestamp}}</p>
                <p><strong>Lead ID:</strong> {{leadId}}</p>
                
                <h4>Key Behaviors:</h4>
                <ul>
                    <li>Time on site: {{sessionData.duration}} seconds</li>
                    <li>Pages viewed: {{sessionData.pageViews}}</li>
                    <li>Source: {{sessionData.referrer}}</li>
                </ul>
            </div>
            
            <center>
                <a href="{{dashboardUrl}}" class="cta-button">View Lead Details</a>
            </center>
            
            <div class="alert-box">
                <strong>Recommended Actions:</strong>
                <ol>
                    <li>Review lead details in the dashboard</li>
                    <li>Contact within 1 hour for best conversion rates</li>
                    <li>Prepare relevant service information</li>
                </ol>
            </div>
        </div>
        <div class="footer">
            <p>Marfinetz Plumbing Lead Tracking System</p>
        </div>
    </div>
</body>
</html>`,
    
    'standard-alert-email': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>New Lead Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4caf50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f5f5f5; padding: 30px; border-radius: 0 0 5px 5px; }
        .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .score { font-size: 24px; font-weight: bold; color: #4caf50; }
        .cta-button { display: inline-block; background-color: #1976d2; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Lead Alert</h1>
        </div>
        <div class="content">
            <div class="details">
                <h3>Lead Score: <span class="score">{{score}}/100</span></h3>
                <p><strong>Page:</strong> {{pageName}}</p>
                <p><strong>Time:</strong> {{timestamp}}</p>
                <p><strong>Lead ID:</strong> {{leadId}}</p>
                <p><strong>Duration:</strong> {{sessionData.duration}} seconds</p>
            </div>
            
            <center>
                <a href="{{dashboardUrl}}" class="cta-button">View Details</a>
            </center>
        </div>
        <div class="footer">
            <p>Marfinetz Plumbing Lead Tracking</p>
        </div>
    </div>
</body>
</html>`
  };

  return templates[templateName] || templates['standard-alert-email'];
}

function generatePlainText(html, data) {
  // Simple HTML to plain text conversion
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Add a plain text version with key information
  return `
Lead Alert - Score: ${data.score}/100

Page Visited: ${data.pageName}
Time: ${data.timestamp}
Lead ID: ${data.leadId}

View full details: ${data.dashboardUrl}

This is an automated alert from Marfinetz Plumbing Lead Tracking System.
  `.trim();
}

module.exports = {
  getEmailTemplate,
  EMAIL_TEMPLATES
};