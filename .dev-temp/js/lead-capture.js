// Lead capture form functionality with n8n webhook integration
document.addEventListener('DOMContentLoaded', function() {
  // Local API endpoint
  const WEBHOOK_URL = '/api/lead-submission';
  
  // Get form element
  const leadForm = document.getElementById('lead-capture-form');
  const submitButton = document.getElementById('lead-submit-button');
  const formMessage = document.getElementById('form-message');
  
  if (leadForm) {
    leadForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Disable submit button and show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<img src="img/w98_hourglass.png" alt="Loading" style="width: 16px; height: 16px; margin-right: 5px;"> Submitting...';
      }
      
      // Clear any previous messages
      if (formMessage) {
        formMessage.style.display = 'none';
        formMessage.className = 'form-message';
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
          if (formMessage) {
            formMessage.className = 'form-message success';
            formMessage.innerHTML = `
              <img src="img/w98_info.png" alt="Success" style="width: 16px; height: 16px; margin-right: 5px;">
              <span>Thank you! We'll contact you within ${result.emergency ? '15 minutes' : '24 hours'}.</span>
            `;
            formMessage.style.display = 'flex';
          }
          
          // Reset form
          leadForm.reset();
          
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
        if (formMessage) {
          formMessage.className = 'form-message error';
          formMessage.innerHTML = `
            <img src="img/msg_error-0.png" alt="Error" style="width: 16px; height: 16px; margin-right: 5px;">
            <span>Error submitting form. Please call us at <a href="tel:814-273-6315">814-273-6315</a></span>
          `;
          formMessage.style.display = 'flex';
        }
      } finally {
        // Re-enable submit button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = 'Submit Request';
        }
      }
    });
  }
});