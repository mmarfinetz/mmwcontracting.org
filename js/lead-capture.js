// Lead capture form functionality with n8n webhook integration
document.addEventListener('DOMContentLoaded', function() {
  // Local API endpoint
  const WEBHOOK_URL = '/api/lead-submission';
  
  // Function to initialize the form when it becomes visible
  function initializeLeadForm() {
    const leadForm = document.getElementById('lead-capture-form');
    const submitButton = document.getElementById('lead-submit-button');
    const formMessage = document.getElementById('form-message');
    
    if (!leadForm) {
      console.log('Lead form not found, will retry when contact window opens');
      return false;
    }
    
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
        
        // Add additional metadata
        leadData.submitted_at = new Date().toISOString();
        leadData.lead_source = 'website_form';
        leadData.page_url = window.location.href;
        
        // Send to n8n webhook
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(leadData)
        });
        
        // Check if request was successful
        if (response.ok) {
          const result = await response.json();
          
          // Show success message
          if (message) {
            message.className = 'form-message success';
            message.innerHTML = `
              <img src="img/w98_info.png" alt="Success" style="width: 16px; height: 16px; margin-right: 5px;">
              <span>Thank you! We'll contact you within ${result.emergency ? '15 minutes' : '24 hours'}.</span>
            `;
            message.style.display = 'flex';
          }
          
          // Reset form
          form.reset();
          
          // Optionally close the window after a delay
          setTimeout(() => {
            const contactWindow = document.getElementById('contact-window');
            if (contactWindow) {
              // Show a thank you message or close the window
              contactWindow.querySelector('.window-content').innerHTML = `
                <div style="text-align: center; padding: 50px;">
                  <img src="img/w98_info.png" alt="Success" style="width: 48px; height: 48px; margin-bottom: 20px;">
                  <h2>Thank You!</h2>
                  <p>Your request has been received.</p>
                  <p>We'll contact you soon.</p>
                </div>
              `;
            }
          }, 3000);
          
        } else {
          throw new Error('Failed to submit form');
        }
        
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Show error message
        if (message) {
          message.className = 'form-message error';
          message.innerHTML = `
            <img src="img/msg_error-0.png" alt="Error" style="width: 16px; height: 16px; margin-right: 5px;">
            <span>Error submitting form. Please call us at <a href="tel:814-273-6315">814-273-6315</a></span>
          `;
          message.style.display = 'flex';
        }
      } finally {
        // Re-enable submit button
        if (button) {
          button.disabled = false;
          button.innerHTML = 'Submit Request';
        }
      }
    });
    
    console.log('Lead capture form initialized successfully');
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
          console.log('Contact window opened, initializing form...');
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
  }
  
  // Also watch for window open events from main.js
  window.addEventListener('windowOpened', function(e) {
    if (e.detail && e.detail.windowId === 'contact-window') {
      console.log('Contact window opened via event, initializing form...');
      setTimeout(() => initializeLeadForm(), 100);
    }
  });
});