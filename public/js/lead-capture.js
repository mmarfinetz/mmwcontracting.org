// Lead capture form functionality with enhanced error handling and logging
document.addEventListener('DOMContentLoaded', function() {
  // Use the Railway tracking API directly
  const API_URL = 'https://mmwcontractingorg-production.up.railway.app/track';
  
  // Configuration
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 2000;
  const LOCAL_STORAGE_KEY = 'mmw_failed_submissions';
  
  // Enhanced logging function
  function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [LEAD-CAPTURE] [${level}] ${message}`;
    
    if (data) {
      console[level.toLowerCase()](logEntry, data);
    } else {
      console[level.toLowerCase()](logEntry);
    }
  }
  
  // Error type detection
  function classifyError(error, response = null) {
    log('DEBUG', 'Classifying error', { error: error.message, response });
    
    // Network connectivity issues
    if (!navigator.onLine) {
      return { type: 'OFFLINE', message: 'No internet connection' };
    }
    
    if (error.name === 'NetworkError' || error.message.includes('Failed to fetch')) {
      return { type: 'NETWORK', message: 'Network connection failed' };
    }
    
    // CORS issues
    if (error.message.includes('CORS') || error.message.includes('Cross-Origin')) {
      return { type: 'CORS', message: 'Server configuration error' };
    }
    
    // Server errors
    if (response) {
      if (response.status >= 500) {
        return { type: 'SERVER', message: 'Server error occurred' };
      } else if (response.status === 429) {
        return { type: 'RATE_LIMIT', message: 'Too many requests, please wait' };
      } else if (response.status >= 400) {
        return { type: 'CLIENT', message: 'Invalid request data' };
      }
    }
    
    // Timeout
    if (error.name === 'AbortError') {
      return { type: 'TIMEOUT', message: 'Request timed out' };
    }
    
    // Unknown error
    return { type: 'UNKNOWN', message: 'An unexpected error occurred' };
  }
  
  // Local storage management for failed submissions
  function saveFailedSubmission(leadData) {
    try {
      const failed = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      failed.push({
        ...leadData,
        failedAt: new Date().toISOString(),
        retryCount: 0
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(failed));
      log('INFO', 'Failed submission saved to local storage', { count: failed.length });
    } catch (e) {
      log('ERROR', 'Failed to save submission to local storage', e);
    }
  }
  
  function getFailedSubmissions() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    } catch (e) {
      log('ERROR', 'Failed to retrieve submissions from local storage', e);
      return [];
    }
  }
  
  function removeFailedSubmission(index) {
    try {
      const failed = getFailedSubmissions();
      failed.splice(index, 1);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(failed));
    } catch (e) {
      log('ERROR', 'Failed to remove submission from local storage', e);
    }
  }
  
  // Retry failed submissions
  async function retryFailedSubmissions() {
    const failed = getFailedSubmissions();
    if (failed.length === 0) return;
    
    log('INFO', `Retrying ${failed.length} failed submissions`);
    
    for (let i = failed.length - 1; i >= 0; i--) {
      const submission = failed[i];
      if (submission.retryCount >= MAX_RETRY_ATTEMPTS) {
        log('WARN', 'Max retry attempts reached for submission', submission);
        continue;
      }
      
      try {
        await submitWithRetry(submission, 1);
        removeFailedSubmission(i);
        log('INFO', 'Successfully retried failed submission');
      } catch (e) {
        failed[i].retryCount++;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(failed));
      }
    }
  }
  
  // Submit with retry logic
  async function submitWithRetry(trackingData, attempt = 1) {
    log('INFO', `Submitting lead data (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})`, {
      leadSource: trackingData.sessionData.leadSource,
      urgency: trackingData.sessionData.urgency
    });
    
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      log('DEBUG', 'API response received', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        log('ERROR', 'API returned error response', {
          status: response.status,
          body: errorBody
        });
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }
      
      const result = await response.json();
      log('INFO', 'Lead submitted successfully', result);
      return result;
      
    } catch (error) {
      const errorInfo = classifyError(error);
      log('ERROR', `Submission failed: ${errorInfo.type}`, {
        message: error.message,
        stack: error.stack,
        attempt
      });
      
      // Retry logic based on error type
      if (attempt < MAX_RETRY_ATTEMPTS) {
        const shouldRetry = ['NETWORK', 'TIMEOUT', 'SERVER'].includes(errorInfo.type);
        
        if (shouldRetry) {
          log('INFO', `Retrying in ${RETRY_DELAY_MS}ms...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
          return submitWithRetry(trackingData, attempt + 1);
        }
      }
      
      throw { original: error, classified: errorInfo };
    }
  }
  
  // Function to initialize the form when it becomes visible
  function initializeLeadForm() {
    const leadForm = document.getElementById('lead-capture-form');
    const submitButton = document.getElementById('lead-submit-button');
    const formMessage = document.getElementById('form-message');
    
    if (!leadForm) {
      log('DEBUG', 'Lead form not found, will retry when contact window opens');
      return false;
    }
    
    log('INFO', 'Initializing lead capture form');
    
    // Remove any existing event listeners to prevent duplicates
    const newForm = leadForm.cloneNode(true);
    leadForm.parentNode.replaceChild(newForm, leadForm);
    
    // Re-get the form and button elements after cloning
    const form = document.getElementById('lead-capture-form');
    const button = document.getElementById('lead-submit-button');
    const message = document.getElementById('form-message');
    
    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        log('INFO', 'Form submission started');
        
        // Disable submit button and show loading state
        if (button) {
          button.disabled = true;
          button.innerHTML = '<img src="img/w98_hourglass.png" alt="Loading" style="width: 16px; height: 16px; margin-right: 5px;"> Submitting...';
        }
        
        // Clear any previous messages
        if (message) {
          message.style.display = 'none';
          message.className = 'form-message';
        }
        
        try {
          // Get form data
          const formData = new FormData(this);
          const leadData = Object.fromEntries(formData.entries());
          
          log('DEBUG', 'Form data collected', {
            name: leadData.name,
            phone: leadData.phone,
            urgency: leadData.urgency,
            service: leadData.service
          });
          
          // Validate required fields
          const requiredFields = ['name', 'phone'];
          const missingFields = requiredFields.filter(field => !leadData[field]);
          
          if (missingFields.length > 0) {
            throw { 
              classified: { 
                type: 'VALIDATION', 
                message: `Missing required fields: ${missingFields.join(', ')}` 
              }
            };
          }
          
          // Format data for the tracking API
          const trackingData = {
            pageUrl: '/contact-form',
            referrer: document.referrer || 'direct',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            sessionData: {
              formSubmission: true,
              leadSource: 'contact_form',
              ...leadData,
              events: [
                { type: 'form_submission', timestamp: Date.now() }
              ],
              duration: 0,
              pageViews: 1
            }
          };
          
          // Submit with retry logic
          const result = await submitWithRetry(trackingData);
          
          // Determine response time based on urgency
          const responseTime = leadData.urgency === 'emergency' ? '15 minutes' : 
                             leadData.urgency === 'same_day' ? '2 hours' : '24 hours';
          
          // Show success message
          if (message) {
            message.className = 'form-message success';
            message.innerHTML = `
              <img src="img/w98_info.png" alt="Success" style="width: 16px; height: 16px; margin-right: 5px;">
              <span>Thank you! We'll contact you within ${responseTime}.</span>
            `;
            message.style.display = 'flex';
          }
          
          // Reset form
          form.reset();
          
          // Check and retry any previously failed submissions
          setTimeout(() => retryFailedSubmissions(), 5000);
          
          // Optionally close the window after a delay
          setTimeout(() => {
            const contactWindow = document.getElementById('contact-window');
            if (contactWindow) {
              // Show a thank you message
              contactWindow.querySelector('.window-content').innerHTML = `
                <div style="text-align: center; padding: 50px;">
                  <img src="img/w98_info.png" alt="Success" style="width: 48px; height: 48px; margin-bottom: 20px;">
                  <h2>Thank You!</h2>
                  <p>Your request has been received.</p>
                  <p>We'll contact you within ${responseTime}.</p>
                  ${getFailedSubmissions().length > 0 ? '<p style="font-size: 12px; color: #666; margin-top: 20px;">We\'ll also retry any previously failed submissions.</p>' : ''}
                </div>
              `;
            }
          }, 3000);
          
        } catch (error) {
          const errorInfo = error.classified || classifyError(error.original || error);
          log('ERROR', 'Form submission failed', {
            type: errorInfo.type,
            message: errorInfo.message,
            error: error.original || error
          });
          
          // Save to local storage for later retry (except for validation errors)
          if (errorInfo.type !== 'VALIDATION' && errorInfo.type !== 'CLIENT') {
            const formData = new FormData(form);
            const leadData = Object.fromEntries(formData.entries());
            saveFailedSubmission({
              pageUrl: '/contact-form',
              referrer: document.referrer || 'direct',
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              screenResolution: `${window.screen.width}x${window.screen.height}`,
              language: navigator.language,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              sessionData: {
                formSubmission: true,
                leadSource: 'contact_form',
                ...leadData,
                events: [
                  { type: 'form_submission', timestamp: Date.now() }
                ],
                duration: 0,
                pageViews: 1
              }
            });
          }
          
          // Show user-friendly error message based on error type
          if (message) {
            message.className = 'form-message error';
            let errorMessage = '';
            
            switch (errorInfo.type) {
              case 'OFFLINE':
                errorMessage = `
                  <img src="img/msg_error-0.png" alt="Error" style="width: 16px; height: 16px; margin-right: 5px;">
                  <span>You're offline. We'll submit when you're back online. Or call: <a href="tel:814-273-6315">814-273-6315</a></span>
                `;
                break;
              case 'NETWORK':
                errorMessage = `
                  <img src="img/msg_error-0.png" alt="Error" style="width: 16px; height: 16px; margin-right: 5px;">
                  <span>Network error. We'll retry automatically. Or call: <a href="tel:814-273-6315">814-273-6315</a></span>
                `;
                break;
              case 'TIMEOUT':
                errorMessage = `
                  <img src="img/msg_error-0.png" alt="Error" style="width: 16px; height: 16px; margin-right: 5px;">
                  <span>Request timed out. We'll retry in the background. Or call: <a href="tel:814-273-6315">814-273-6315</a></span>
                `;
                break;
              case 'SERVER':
                errorMessage = `
                  <img src="img/msg_error-0.png" alt="Error" style="width: 16px; height: 16px; margin-right: 5px;">
                  <span>Server is temporarily down. We'll retry later. Please call: <a href="tel:814-273-6315">814-273-6315</a></span>
                `;
                break;
              case 'RATE_LIMIT':
                errorMessage = `
                  <img src="img/msg_error-0.png" alt="Error" style="width: 16px; height: 16px; margin-right: 5px;">
                  <span>Too many requests. Please wait a moment or call: <a href="tel:814-273-6315">814-273-6315</a></span>
                `;
                break;
              case 'VALIDATION':
                errorMessage = `
                  <img src="img/msg_error-0.png" alt="Error" style="width: 16px; height: 16px; margin-right: 5px;">
                  <span>${errorInfo.message}</span>
                `;
                break;
              default:
                errorMessage = `
                  <img src="img/msg_error-0.png" alt="Error" style="width: 16px; height: 16px; margin-right: 5px;">
                  <span>Error submitting form. Please call us at <a href="tel:814-273-6315">814-273-6315</a></span>
                `;
            }
            
            message.innerHTML = errorMessage;
            message.style.display = 'flex';
            
            // Show retry count if applicable
            const failedCount = getFailedSubmissions().length;
            if (failedCount > 0 && errorInfo.type !== 'VALIDATION') {
              message.innerHTML += `<div style="font-size: 11px; margin-top: 5px;">We'll retry automatically (${failedCount} pending)</div>`;
            }
          }
        } finally {
          // Re-enable submit button
          if (button) {
            button.disabled = false;
            button.innerHTML = 'Submit Request';
          }
        }
      });
      
      log('INFO', 'Lead capture form initialized successfully');
      return true;
    }
    
    return false;
  }
  
  // Try to initialize on page load
  initializeLeadForm();
  
  // Watch for when the contact window becomes visible
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.target.id === 'contact-window' && 
          mutation.type === 'attributes' && 
          mutation.attributeName === 'style') {
        const contactWindow = document.getElementById('contact-window');
        if (contactWindow && contactWindow.style.display !== 'none') {
          log('DEBUG', 'Contact window opened via mutation observer');
          setTimeout(() => initializeLeadForm(), 100); // Small delay to ensure DOM is ready
        }
      }
    });
  });
  
  // Start observing the contact window
  const contactWindow = document.getElementById('contact-window');
  if (contactWindow) {
    observer.observe(contactWindow, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
    log('DEBUG', 'Started observing contact window for visibility changes');
  }
  
  // Also watch for window open events from main.js
  window.addEventListener('windowOpened', function(e) {
    if (e.detail && e.detail.windowId === 'contact-window') {
      log('DEBUG', 'Contact window opened via custom event');
      setTimeout(() => initializeLeadForm(), 100);
    }
  });
  
  // Retry failed submissions when coming back online
  window.addEventListener('online', function() {
    log('INFO', 'Network connection restored, retrying failed submissions');
    setTimeout(() => retryFailedSubmissions(), 2000);
  });
  
  // Log when going offline
  window.addEventListener('offline', function() {
    log('WARN', 'Network connection lost');
  });
  
  // Periodically check for failed submissions (every 5 minutes)
  setInterval(function() {
    const failed = getFailedSubmissions();
    if (failed.length > 0) {
      log('INFO', `Periodic check: ${failed.length} failed submissions found`);
      retryFailedSubmissions();
    }
  }, 5 * 60 * 1000);
  
  // Check failed submissions on page load
  const failedOnLoad = getFailedSubmissions();
  if (failedOnLoad.length > 0) {
    log('INFO', `Found ${failedOnLoad.length} failed submissions from previous session`);
    setTimeout(() => retryFailedSubmissions(), 10000); // Wait 10 seconds after page load
  }
  
  // Export functions for debugging in console
  window.mmwLeadCapture = {
    getFailedSubmissions,
    retryFailedSubmissions,
    clearFailedSubmissions: function() {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      log('INFO', 'Cleared all failed submissions from local storage');
    },
    setLogLevel: function(level) {
      // This could be expanded to filter log levels
      log('INFO', `Log level set to ${level}`);
    }
  };
  
  log('INFO', 'Lead capture module initialized');
});