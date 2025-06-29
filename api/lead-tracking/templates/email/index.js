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

// Helper function to get nested property value
function getNestedValue(obj, path) {
  return path.split('.').reduce((curr, prop) => {
    return curr && curr[prop] !== undefined ? curr[prop] : '';
  }, obj);
}

// Helper function to format urgency values
function formatUrgency(urgency) {
  const urgencyMap = {
    'emergency': 'EMERGENCY - Need help NOW!',
    'same_day': 'Same day service needed',
    'this_week': 'This week is fine',
    'flexible': 'Flexible on timing'
  };
  return urgencyMap[urgency] || urgency;
}

// Helper function to format property type
function formatPropertyType(type) {
  const typeMap = {
    'residential': 'Residential',
    'commercial': 'Commercial'
  };
  return typeMap[type] || type;
}

// Helper function to replace all placeholders including nested ones
function replacePlaceholders(template, data) {
  // First, find all placeholders in the template
  const placeholderRegex = /{{([^}]+)}}/g;
  
  return template.replace(placeholderRegex, (match, path) => {
    let value = getNestedValue(data, path);
    
    // Format specific fields
    if (path === 'sessionData.urgency') {
      value = formatUrgency(value);
    } else if (path === 'sessionData.property_type') {
      value = formatPropertyType(value);
    } else if (path === 'sessionData.preferred_contact') {
      const contactMap = {
        'phone': 'Call me',
        'email': 'Email me',
        'text': 'Text me'
      };
      value = contactMap[value] || value;
    }
    
    return value !== undefined && value !== null ? value : match;
  });
}

async function getEmailTemplate(templateName, data) {
  const config = EMAIL_TEMPLATES[templateName];
  if (!config) {
    throw new Error(`Email template not found: ${templateName}`);
  }

  // Process subject line
  let subject = replacePlaceholders(config.subject, data);

  // Load HTML template
  let html;
  try {
    const templatePath = path.join(__dirname, config.template);
    html = await fs.readFile(templatePath, 'utf8');
  } catch (error) {
    // Fallback to inline template if file not found
    html = getInlineTemplate(templateName, data);
  }

  // Replace placeholders in HTML including nested properties
  html = replacePlaceholders(html, data);

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
                <p><strong>Lead ID:</strong> {{leadId}}</p>
                <p><strong>Time:</strong> {{timestamp}}</p>
                <p><strong>Page Visited:</strong> {{pageName}}</p>
                
                <h4>Contact Information:</h4>
                <ul>
                    <li><strong>Name:</strong> {{sessionData.name}}</li>
                    <li><strong>Phone:</strong> <a href="tel:{{sessionData.phone}}" style="color: #1976d2;">{{sessionData.phone}}</a></li>
                    <li><strong>Email:</strong> <a href="mailto:{{sessionData.email}}" style="color: #1976d2;">{{sessionData.email}}</a></li>
                    <li><strong>Property Type:</strong> {{sessionData.property_type}}</li>
                    <li><strong>Service Address:</strong> {{sessionData.location}}</li>
                    <li><strong>Urgency:</strong> <span style="color: #d32f2f; font-weight: bold;">{{sessionData.urgency}}</span></li>
                    <li><strong>Preferred Contact:</strong> {{sessionData.preferred_contact}}</li>
                </ul>
                
                <h4>Problem Description:</h4>
                <p style="background-color: #ffebee; padding: 10px; border-left: 3px solid #d32f2f; margin: 10px 0;">{{sessionData.problem}}</p>
                
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
            
            <div class="alert-box">
                <strong>Recommended Actions:</strong>
                <ol>
                    <li>Call the customer immediately if phone number is available</li>
                    <li>Review the session details above to understand customer behavior</li>
                    <li>Prepare emergency service options based on the page they visited</li>
                    <li>Follow up within 15 minutes for best conversion rates</li>
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
                <p><strong>Lead ID:</strong> {{leadId}}</p>
                <p><strong>Time:</strong> {{timestamp}}</p>
                <p><strong>Page Visited:</strong> {{pageName}}</p>
                
                <h4>Contact Information:</h4>
                <ul>
                    <li><strong>Name:</strong> {{sessionData.name}}</li>
                    <li><strong>Phone:</strong> <a href="tel:{{sessionData.phone}}" style="color: #1976d2;">{{sessionData.phone}}</a></li>
                    <li><strong>Email:</strong> <a href="mailto:{{sessionData.email}}" style="color: #1976d2;">{{sessionData.email}}</a></li>
                    <li><strong>Property Type:</strong> {{sessionData.property_type}}</li>
                    <li><strong>Service Address:</strong> {{sessionData.location}}</li>
                    <li><strong>Urgency:</strong> <span style="color: #f57c00; font-weight: bold;">{{sessionData.urgency}}</span></li>
                    <li><strong>Preferred Contact:</strong> {{sessionData.preferred_contact}}</li>
                </ul>
                
                <h4>Problem Description:</h4>
                <p style="background-color: #fff3e0; padding: 10px; border-left: 3px solid #f57c00; margin: 10px 0;">{{sessionData.problem}}</p>
                
                <h4>Key Behaviors:</h4>
                <ul>
                    <li>Time on site: {{sessionData.duration}} seconds</li>
                    <li>Pages viewed: {{sessionData.pageViews}}</li>
                    <li>Source: {{sessionData.referrer}}</li>
                </ul>
            </div>
            
            <div class="alert-box">
                <strong>Recommended Actions:</strong>
                <ol>
                    <li>Review the lead details above to understand customer intent</li>
                    <li>Contact within 1 hour for best conversion rates</li>
                    <li>Prepare relevant service information based on pages viewed</li>
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
                <p><strong>Lead ID:</strong> {{leadId}}</p>
                <p><strong>Time:</strong> {{timestamp}}</p>
                <p><strong>Page:</strong> {{pageName}}</p>
                
                <h4>Contact Information:</h4>
                <ul>
                    <li><strong>Name:</strong> {{sessionData.name}}</li>
                    <li><strong>Phone:</strong> <a href="tel:{{sessionData.phone}}" style="color: #1976d2;">{{sessionData.phone}}</a></li>
                    <li><strong>Email:</strong> <a href="mailto:{{sessionData.email}}" style="color: #1976d2;">{{sessionData.email}}</a></li>
                    <li><strong>Service Address:</strong> {{sessionData.location}}</li>
                </ul>
                
                <h4>Problem Summary:</h4>
                <p style="background-color: #f0f8ff; padding: 10px; border-left: 3px solid #4caf50;">{{sessionData.problem}}</p>
                
                <h4>Session Info:</h4>
                <p><strong>Duration:</strong> {{sessionData.duration}} seconds</p>
            </div>
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

Lead ID: ${data.leadId}
Time: ${data.timestamp}
Page Visited: ${data.pageName}

CONTACT INFORMATION:
- Name: ${data.sessionData?.name || 'N/A'}
- Phone: ${data.sessionData?.phone || 'N/A'}
- Email: ${data.sessionData?.email || 'N/A'}
- Property Type: ${formatPropertyType(data.sessionData?.property_type) || 'N/A'}
- Service Address: ${data.sessionData?.location || 'N/A'}
- Urgency: ${formatUrgency(data.sessionData?.urgency) || 'N/A'}
- Preferred Contact: ${data.sessionData?.preferred_contact === 'phone' ? 'Call me' : data.sessionData?.preferred_contact === 'email' ? 'Email me' : data.sessionData?.preferred_contact === 'text' ? 'Text me' : data.sessionData?.preferred_contact || 'N/A'}

PROBLEM DESCRIPTION:
${data.sessionData?.problem || 'N/A'}

Session Details:
- Duration: ${data.sessionData?.duration || 'N/A'} seconds
- Pages Viewed: ${data.sessionData?.pageViews || 'N/A'}
- Device: ${data.sessionData?.deviceType || 'N/A'}

Scoring Breakdown:
- Behavior Score: ${data.sessionData?.scoreBreakdown?.behavior || 'N/A'}
- Timing Score: ${data.sessionData?.scoreBreakdown?.time || 'N/A'}
- Intent Score: ${data.sessionData?.scoreBreakdown?.intent || 'N/A'}

This is an automated alert from Marfinetz Plumbing Lead Tracking System.
  `.trim();
}

module.exports = {
  getEmailTemplate,
  EMAIL_TEMPLATES
};