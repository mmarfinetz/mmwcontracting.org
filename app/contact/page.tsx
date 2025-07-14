'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import type { Metadata } from 'next';

export default function ContactPage() {
  useEffect(() => {
    // Initialize form message handling
    const handleFormMessage = () => {
      const formMessage = document.getElementById('form-message');
      if (formMessage) {
        formMessage.style.display = 'none';
      }
    };

    handleFormMessage();
  }, []);

  return (
    <>
      <Script src="/js/lead-capture.js" strategy="afterInteractive" />
      
      <div className="contact-page-container">
        <style jsx global>{`
          .contact-page-container {
            min-height: calc(100vh - 200px);
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }

          .win95-window {
            background: #c0c0c0;
            border: 2px solid;
            border-color: #ffffff #808080 #808080 #ffffff;
            box-shadow: inset 1px 1px 0 0 #ffffff, 
                        1px 1px 0 0 #000000,
                        2px 2px 2px 0 rgba(0,0,0,0.1);
          }

          .win95-title-bar {
            background: linear-gradient(to right, #000080, #1084d0);
            color: white;
            padding: 2px 4px;
            font-size: 12px;
            font-weight: bold;
            display: flex;
            align-items: center;
            height: 20px;
            font-family: "MS Sans Serif", Tahoma, sans-serif;
          }

          .win95-title-bar::before {
            content: '';
            display: inline-block;
            width: 16px;
            height: 16px;
            background-image: url('/logo.svg');
            background-size: contain;
            background-repeat: no-repeat;
            margin-right: 4px;
            filter: brightness(2);
          }

          .win95-content {
            padding: 20px;
            background: #c0c0c0;
          }

          .win95-form {
            font-family: "MS Sans Serif", Tahoma, sans-serif;
            font-size: 11px;
          }

          .win95-form h3 {
            margin-top: 0;
            font-size: 14px;
            font-weight: bold;
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-group label {
            display: block;
            margin-bottom: 4px;
            font-weight: normal;
          }

          .win95-input,
          .win95-select,
          .win95-textarea {
            width: 100%;
            padding: 2px 4px;
            border: 2px solid;
            border-color: #808080 #ffffff #ffffff #808080;
            background: white;
            font-family: "MS Sans Serif", Tahoma, sans-serif;
            font-size: 11px;
          }

          .win95-textarea {
            resize: vertical;
            min-height: 60px;
          }

          .win95-button {
            background: #c0c0c0;
            border: 2px solid;
            border-color: #ffffff #808080 #808080 #ffffff;
            padding: 4px 16px;
            font-family: "MS Sans Serif", Tahoma, sans-serif;
            font-size: 11px;
            cursor: pointer;
            min-width: 75px;
            text-align: center;
          }

          .win95-button:active {
            border-color: #808080 #ffffff #ffffff #808080;
            padding: 5px 15px 3px 17px;
          }

          .win95-button.primary {
            font-weight: bold;
          }

          .form-buttons {
            display: flex;
            gap: 8px;
            margin-top: 20px;
          }

          .form-message {
            background: white;
            border: 2px solid;
            border-color: #808080 #ffffff #ffffff #808080;
            padding: 10px;
            margin-bottom: 15px;
            font-size: 11px;
          }

          .form-message.error {
            color: #cc0000;
          }

          .form-message.success {
            color: #008000;
          }

          @media (max-width: 768px) {
            .contact-page-container {
              padding: 20px 10px;
            }

            .win95-content {
              padding: 15px;
            }
          }
        `}</style>

        <div className="win95-window">
          <div className="win95-title-bar">
            Contact Us - Request Service
          </div>
          <div className="win95-content">
            <form id="lead-capture-form" className="win95-form">
              <h3>Get Your Plumbing Problem Fixed Today!</h3>
              
              <div className="form-message" id="form-message" style={{display: 'none'}}></div>
              
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input type="text" id="name" name="name" required className="win95-input" autoComplete="name" />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input type="tel" id="phone" name="phone" required className="win95-input" autoComplete="tel" />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input type="email" id="email" name="email" required className="win95-input" autoComplete="email" />
              </div>
              
              <div className="form-group">
                <label htmlFor="property_type">Property Type *</label>
                <select id="property_type" name="property_type" required className="win95-select">
                  <option value="">Select Property Type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Service Address *</label>
                <input type="text" id="location" name="location" required className="win95-input" placeholder="Street address, City, PA" autoComplete="street-address" />
              </div>
              
              <div className="form-group">
                <label htmlFor="urgency">How urgent is this? *</label>
                <select id="urgency" name="urgency" required className="win95-select">
                  <option value="">Select Urgency</option>
                  <option value="emergency">Emergency - Need help NOW!</option>
                  <option value="same_day">Same day service needed</option>
                  <option value="this_week">This week is fine</option>
                  <option value="flexible">I&apos;m flexible on timing</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="problem">Describe your plumbing problem *</label>
                <textarea id="problem" name="problem" required className="win95-textarea" rows={4} placeholder="Please describe the issue you're experiencing..."></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="preferred_contact">Preferred Contact Method</label>
                <select id="preferred_contact" name="preferred_contact" className="win95-select">
                  <option value="phone">Call me</option>
                  <option value="email">Email me</option>
                  <option value="text">Text me</option>
                </select>
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="win95-button primary" id="lead-submit-button">Submit Request</button>
                <button type="button" className="win95-button" onClick={() => (document.getElementById('lead-capture-form') as HTMLFormElement)?.reset()}>Clear Form</button>
              </div>
              
              <p style={{textAlign: 'center', marginTop: '20px', color: '#666'}}>
                Or call us directly at <a href="tel:814-273-6315" style={{color: '#0000FF'}}>814-273-6315</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}