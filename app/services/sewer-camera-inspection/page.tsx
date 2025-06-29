import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sewer Camera Inspection in Erie County | Marfinetz Plumbing',
  description: 'Professional sewer camera inspection services in Erie County, Lake City PA, and Conneaut OH. Find pipe problems without destructive digging. Call (814) 273-6315.',
}

export default function SewerCameraInspection() {
  return (
    <main>
      {/* Service Hero Section */}
      <section className="service-hero">
        <div className="container">
          <div className="service-hero-content">
            <h1>Professional Sewer Camera Inspection Services</h1>
            <p className="service-hero-subtitle">Find & Fix Sewer Problems Fast with Video Pipe Inspection</p>
            <p className="service-hero-description">At Marfinetz Plumbing, we use state-of-the-art sewer camera technology to inspect your pipes and sewer lines without destructive digging or guesswork. Our professional sewer camera inspection services help homeowners and businesses in Erie County, Lake City, and Conneaut identify plumbing problems quickly and accurately.</p>
            <div className="service-hero-cta">
              <a href="tel:8142736315" className="btn btn-primary">Call (814) 273-6315</a>
              <a href="/contact" className="btn btn-secondary">Request Service</a>
            </div>
          </div>
          <div className="service-hero-image">
            <img src="/img/sewer-camera-inspection-hero.jpg" alt="Sewer Camera Inspection Service" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How Our Sewer Camera Inspection Works</h2>
            <p>Advanced technology for accurate diagnosis</p>
          </div>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Camera Insertion</h3>
                <p>Our technicians insert a high-definition waterproof camera attached to a flexible rod into your sewer line or drain.</p>
              </div>
              <div className="step-image">
                <img src="/img/camera-insertion.jpg" alt="Sewer Camera Insertion" />
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Real-Time Video</h3>
                <p>As the camera moves through the pipe, it transmits real-time video to a monitor, allowing our technicians to see exactly what&apos;s happening inside your pipes.</p>
              </div>
              <div className="step-image">
                <img src="/img/real-time-video.jpg" alt="Real-Time Sewer Video" />
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Problem Identification</h3>
                <p>We identify issues such as blockages, cracks, breaks, tree root intrusions, pipe collapses, or misalignments.</p>
              </div>
              <div className="step-image">
                <img src="/img/problem-identification.jpg" alt="Sewer Problem Identification" />
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Solution Recommendation</h3>
                <p>Based on our findings, we recommend the most effective and cost-efficient solution for your specific situation.</p>
              </div>
              <div className="step-image">
                <img src="/img/solution-recommendation.jpg" alt="Plumbing Solution Recommendation" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <div className="section-header">
            <h2>Benefits of Video Pipe Inspection</h2>
            <p>Why camera inspection is the smart choice for sewer diagnostics</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/accurate-icon.png" alt="Accurate Diagnosis Icon" />
              </div>
              <h3>Accurate Diagnosis</h3>
              <p>See exactly what&apos;s causing your plumbing issues with high-definition video evidence.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/non-destructive-icon.png" alt="Non-Destructive Icon" />
              </div>
              <h3>Non-Destructive</h3>
              <p>No need to dig up your yard or break through walls to locate problems.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/cost-effective-icon.png" alt="Cost-Effective Icon" />
              </div>
              <h3>Cost-Effective</h3>
              <p>Pinpoint problems to avoid unnecessary repairs and save money in the long run.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/preventative-icon.png" alt="Preventative Maintenance Icon" />
              </div>
              <h3>Preventative Maintenance</h3>
              <p>Identify potential issues before they become expensive emergencies.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/documentation-icon.png" alt="Documentation Icon" />
              </div>
              <h3>Documentation</h3>
              <p>Receive video evidence of your pipe condition for your records or insurance purposes.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/peace-of-mind-icon.png" alt="Peace of Mind Icon" />
              </div>
              <h3>Peace of Mind</h3>
              <p>Know exactly what&apos;s happening in your plumbing system with visual confirmation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* When to Get Section */}
      <section className="when-to-get">
        <div className="container">
          <div className="section-header">
            <h2>When to Get a Sewer Camera Inspection</h2>
            <p>Don&apos;t wait until it&apos;s too late</p>
          </div>
          <div className="reasons-grid">
            <div className="reason-card">
              <div className="reason-icon">
                <img src="/img/recurring-clogs-icon.png" alt="Recurring Clogs Icon" />
              </div>
              <h3>Recurring Drain Clogs</h3>
              <p>If your drains keep clogging despite repeated clearing attempts, a deeper issue may be present.</p>
            </div>
            <div className="reason-card">
              <div className="reason-icon">
                <img src="/img/slow-drains-icon.png" alt="Slow Drains Icon" />
              </div>
              <h3>Slow Draining Fixtures</h3>
              <p>Multiple slow-draining sinks, tubs, or toilets often indicate a sewer line problem.</p>
            </div>
            <div className="reason-card">
              <div className="reason-icon">
                <img src="/img/sewage-odors-icon.png" alt="Sewage Odors Icon" />
              </div>
              <h3>Sewage Odors</h3>
              <p>Unpleasant smells in your home or yard could signal a broken or leaking sewer pipe.</p>
            </div>
            <div className="reason-card">
              <div className="reason-icon">
                <img src="/img/home-purchase-icon.png" alt="Home Purchase Icon" />
              </div>
              <h3>Before Purchasing a Home</h3>
              <p>Inspect the sewer line before buying to avoid expensive surprises after closing.</p>
            </div>
            <div className="reason-card">
              <div className="reason-icon">
                <img src="/img/older-home-icon.png" alt="Older Home Icon" />
              </div>
              <h3>Older Homes</h3>
              <p>Homes over 20 years old are more prone to sewer line issues and should be inspected regularly.</p>
            </div>
            <div className="reason-card">
              <div className="reason-icon">
                <img src="/img/renovation-icon.png" alt="Renovation Icon" />
              </div>
              <h3>Before Renovations</h3>
              <p>Check sewer lines before adding bathrooms or making major plumbing changes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Sewer Camera Inspection Pricing</h2>
            <p>Transparent pricing with no hidden fees</p>
          </div>
          <div className="pricing-options">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Standard Inspection</h3>
                <p className="price">$299</p>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>Complete main line inspection</li>
                  <li>Video recording of findings</li>
                  <li>Written assessment report</li>
                  <li>Repair recommendations</li>
                </ul>
              </div>
              <div className="pricing-cta">
                <a href="tel:8142736315" className="btn btn-primary">Call to Schedule</a>
              </div>
            </div>
            <div className="pricing-note">
              <p>* Pricing may vary based on the complexity and accessibility of your plumbing system. Call for an accurate quote.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Marfinetz Plumbing for Sewer Inspection</h2>
            <p>The trusted choice in Erie County, Lake City, and Conneaut</p>
          </div>
          <div className="reasons-grid">
            <div className="reason-card">
              <div className="reason-icon">
                <img src="/img/service-area-icon.png" alt="Service Area Icon" />
              </div>
              <h3>Tri-Market Service Area</h3>
              <p>Serving Erie County, Lake City, and Conneaut areas with prompt, reliable service.</p>
            </div>
            <div className="reason-card">
              <div className="reason-icon">
                <img src="/img/equipment-icon.png" alt="Equipment Icon" />
              </div>
              <h3>State-of-the-Art Equipment</h3>
              <p>We use the latest high-definition camera technology for clear, accurate inspections.</p>
            </div>
            <div className="reason-card">
              <div className="reason-icon">
                <img src="/img/technician-icon.png" alt="Technician Icon" />
              </div>
              <h3>Experienced Technicians</h3>
              <p>Our licensed professionals are trained to identify and solve complex sewer issues.</p>
            </div>
            <div className="reason-card">
              <div className="reason-icon">
                <img src="/img/pricing-icon.png" alt="Pricing Icon" />
              </div>
              <h3>Upfront, Transparent Pricing</h3>
              <p>No surprises or hidden fees - just honest, straightforward pricing.</p>
            </div>
            <div className="reason-card">
              <div className="reason-icon">
                <img src="/img/same-day-icon.png" alt="Same Day Icon" />
              </div>
              <h3>Same-Day Service Available</h3>
              <p>Quick response times when you need help fast.</p>
            </div>
            <div className="reason-card">
              <div className="reason-icon">
                <img src="/img/guarantee-icon.png" alt="Guarantee Icon" />
              </div>
              <h3>100% Satisfaction Guarantee</h3>
              <p>We stand behind our work with a complete satisfaction guarantee.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Common questions about sewer camera inspections</p>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">
                <h3>How much does a sewer camera inspection cost?</h3>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">
                <p>Our standard sewer camera inspection starts at $299. The exact price depends on the complexity and accessibility of your plumbing system. Call us for an accurate quote based on your specific situation.</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>How long does a sewer camera inspection take?</h3>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">
                <p>Most inspections take 30-60 minutes to complete, depending on the length and condition of your pipes. We&apos;ll provide a more specific timeframe when you schedule your appointment.</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>Can a sewer camera detect all types of problems?</h3>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">
                <p>Our cameras can detect most common issues including blockages, cracks, root intrusions, and pipe collapses. However, some very small hairline cracks or issues beyond the reach of the camera may require additional diagnostic methods.</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>Do I need to prepare my home for a sewer camera inspection?</h3>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">
                <p>We&apos;ll need access to your main cleanout or an appropriate access point to your sewer system. Our technician will advise you on specific requirements when you schedule your appointment.</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>How often should I have my sewer line inspected?</h3>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">
                <p>For homes older than 20 years, we recommend a sewer inspection every 2-3 years as preventative maintenance. Newer homes can typically go 5-7 years between inspections if no issues are present.</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <h3>Do you serve Conneaut, Ohio?</h3>
                <span className="faq-toggle">+</span>
              </div>
              <div className="faq-answer">
                <p>Yes! We proudly serve Conneaut, Ohio in addition to our Pennsylvania service areas. Our strategic location allows us to provide prompt service across state lines.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Schedule Your Sewer Camera Inspection?</h2>
            <p>Contact Marfinetz Plumbing today for fast, professional service in Erie County, Lake City, and Conneaut.</p>
            <div className="cta-buttons">
              <a href="tel:8142736315" className="btn btn-primary">Call (814) 273-6315</a>
              <a href="/contact" className="btn btn-secondary">Request Service Online</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
