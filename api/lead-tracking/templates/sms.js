const SMS_TEMPLATES = {
  'immediate-alert-sms': `🚨 URGENT: Emergency lead on {{pageName}}. Score: {{score}}/100. Customer may need immediate assistance. Phone: {{phoneNumber}}. View details: {{dashboardUrl}}`,
  
  'high-priority-sms': `⚡ High-priority lead detected! Score: {{score}}/100. Page: {{pageName}}. Quick follow-up recommended. Check dashboard: {{dashboardUrl}}`,
  
  'test-sms': `Test notification from Marfinetz Plumbing lead tracking. Score: {{score}}. Dashboard: {{dashboardUrl}}`,
  
  'default': `New lead alert - Score: {{score}}. View details at {{dashboardUrl}}`
};

module.exports = SMS_TEMPLATES;