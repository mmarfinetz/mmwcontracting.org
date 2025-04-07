import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plumbing & Sewer Services in Conneaut, OH | MMW Contracting',
  description: 'Professional plumbing and sewer camera inspection services in Conneaut, Ohio. Fast response times and quality service across state lines. Call (814) 273-6315.',
}

export default function ConneautOH() {
  return (
    <main>
      {/* Location Hero Section */}
      <section className="location-hero">
        <div className="container">
          <div className="location-hero-content">
            <h1>Professional Plumbing Services in Conneaut, Ohio</h1>
            <p className="location-hero-subtitle">Quality Plumbing & Sewer Services Across State Lines</p>
            <p className="location-hero-description">MMW Contracting proudly serves Conneaut, Ohio with the same high-quality plumbing services we provide in Pennsylvania. Our strategic location allows us to offer fast response times and reliable service to our Ohio neighbors.</p>
            <div className="location-hero-cta">
              <a href="tel:8142736315" className="btn btn-primary">Call (814) 273-6315</a>
              <a href="/contact" className="btn btn-secondary">Request Service</a>
            </div>
          </div>
          <div className="location-hero-image">
            <img src="/img/conneaut-oh.jpg" alt="Conneaut, Ohio" />
          </div>
        </div>
      </section>

      {/* Services in Conneaut Section */}
      <section className="location-services">
        <div className="container">
          <div className="section-header">
            <h2>Our Services in Conneaut</h2>
            <p>Comprehensive plumbing solutions for Ohio residents</p>
          </div>
          <div className="services-grid">
            {/* Sewer Camera Inspection Card */}
            <div className="service-card featured">
              <div className="service-icon">
                <img src="/img/camera-icon.png" alt="Sewer Camera Icon" />
              </div>
              <h3>Sewer Camera Inspection</h3>
              <p>Our high-definition sewer camera inspections help Conneaut homeowners identify blockages, cracks, and other issues without destructive digging.</p>
              <a href="/services/sewer-camera-inspection" className="btn btn-outline">Learn More</a>
            </div>
            
            {/* Drain Cleaning Card */}
            <div className="service-card">
              <div className="service-icon">
                <img src="/img/drain-icon.png" alt="Drain Cleaning Icon" />
              </div>
              <h3>Drain Cleaning & Snaking</h3>
              <p>Professional solutions for clogged drains and sewer lines in Conneaut homes and businesses.</p>
              <a href="/services/drain-cleaning" className="btn btn-outline">Learn More</a>
            </div>
            
            {/* Sewer Line Repair Card */}
            <div className="service-card">
              <div className="service-icon">
                <img src="/img/pipe-icon.png" alt="Sewer Line Repair Icon" />
              </div>
              <h3>Sewer Line Repair</h3>
              <p>Expert repair and replacement services for damaged sewer lines in Conneaut, including trenchless options.</p>
              <a href="/services/sewer-line-repair" className="btn btn-outline">Learn More</a>
            </div>
            
            {/* Emergency Services Card */}
            <div className="service-card">
              <div className="service-icon">
                <img src="/img/emergency-icon.png" alt="Emergency Plumbing Icon" />
              </div>
              <h3>Emergency Plumbing</h3>
              <p>24/7 emergency service for Conneaut residents facing burst pipes, major leaks, sewer backups, and other plumbing emergencies.</p>
              <a href="/services/emergency-plumbing" className="btn btn-outline">Learn More</a>
            </div>
            
            {/* View All Services Button */}
            <div className="view-all">
              <a href="/services" className="btn btn-primary">View All Services</a>
            </div>
          </div>
        </div>
      </section>

      {/* Conneaut Service Area Section */}
      <section className="service-area-map">
        <div className="container">
          <div className="section-header">
            <h2>Our Conneaut Service Area</h2>
            <p>Fast response times throughout Conneaut and surrounding areas</p>
          </div>
          <div className="map-container">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d47942.30129019611!2d-80.59999999999999!3d41.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8832a2a4b2a2a2a3%3A0x1a1a1a1a1a1a1a1a!2sConneaut%2C%20OH!5e0!3m2!1sen!2sus!4v1617304829000!5m2!1sen!2sus" width="100%" height="450" style={{border:0}} allowFullScreen={true} loading="lazy"></iframe>
          </div>
          <div className="neighborhoods">
            <h3>Neighborhoods We Serve in Conneaut</h3>
            <div className="neighborhoods-grid">
              <ul>
                <li>Downtown Conneaut</li>
                <li>Conneaut Harbor</li>
                <li>Amboy</li>
                <li>South Ridge</li>
              </ul>
              <ul>
                <li>North Kingsville</li>
                <li>East Conneaut</li>
                <li>West Conneaut</li>
                <li>Lakeside</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Common Plumbing Issues in Conneaut Section */}
      <section className="common-issues">
        <div className="container">
          <div className="section-header">
            <h2>Common Plumbing Issues in Conneaut</h2>
            <p>Local challenges we help solve</p>
          </div>
          <div className="issues-grid">
            <div className="issue-card">
              <div className="issue-icon">
                <img src="/img/aging-pipes-icon.png" alt="Aging Pipes Icon" />
              </div>
              <h3>Aging Infrastructure</h3>
              <p>Many Conneaut homes have older plumbing systems that are prone to leaks, corrosion, and failures. Our sewer camera inspections can identify these issues before they become major problems.</p>
            </div>
            <div className="issue-card">
              <div className="issue-icon">
                <img src="/img/tree-roots-icon.png" alt="Tree Roots Icon" />
              </div>
              <h3>Tree Root Intrusion</h3>
              <p>Conneaut's mature trees can cause significant damage to sewer lines. Our camera inspections can identify root intrusions and help target repairs precisely.</p>
            </div>
            <div className="issue-card">
              <div className="issue-icon">
                <img src="/img/soil-icon.png" alt="Soil Icon" />
              </div>
              <h3>Soil Conditions</h3>
              <p>The clay-heavy soil in parts of Conneaut can put pressure on pipes and cause shifting that leads to cracks and breaks. We can identify these issues with our camera equipment.</p>
            </div>
            <div className="issue-card">
              <div className="issue-icon">
                <img src="/img/winter-icon.png" alt="Winter Icon" />
              </div>
              <h3>Winter Freezing</h3>
              <p>Conneaut's cold winters can lead to frozen and burst pipes. We provide emergency services and preventative maintenance to protect your plumbing system.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials from Conneaut Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Conneaut Customers Say</h2>
            <p>Read reviews from our Ohio clients</p>
          </div>
          <div className="testimonials-slider">
            {/* Testimonial 1 */}
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">"I was worried about hiring a company from across state lines, but MMW Contracting arrived quickly and solved our sewer backup problem. Their camera inspection found the exact location of the blockage."</p>
              <div className="testimonial-author">
                <p className="author-name">Robert T.</p>
                <p className="author-location">Conneaut, OH</p>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">"We had multiple plumbers look at our recurring drain problems without success. MMW's camera inspection found tree roots that other companies missed. Problem solved!"</p>
              <div className="testimonial-author">
                <p className="author-name">Jennifer L.</p>
                <p className="author-location">Conneaut Harbor, OH</p>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">"Fast response time even though we're in Ohio. Their sewer camera inspection saved us thousands in unnecessary repairs by pinpointing the exact problem area."</p>
              <div className="testimonial-author">
                <p className="author-name">Michael D.</p>
                <p className="author-location">North Kingsville, OH</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us for Conneaut Section */}
      <section className="why-choose-us">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose MMW Contracting in Conneaut</h2>
            <p>The benefits of our cross-border service</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/cross-border-icon.png" alt="Cross-Border Icon" />
              </div>
              <h3>Cross-Border Expertise</h3>
              <p>We're licensed and insured to work in both Pennsylvania and Ohio, providing seamless service across state lines.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/response-time-icon.png" alt="Response Time Icon" />
              </div>
              <h3>Fast Response Times</h3>
              <p>Our strategic location allows us to reach Conneaut customers quickly, even for emergency services.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/local-knowledge-icon.png" alt="Local Knowledge Icon" />
              </div>
              <h3>Local Knowledge</h3>
              <p>We understand Conneaut's unique plumbing challenges and infrastructure issues.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/same-quality-icon.png" alt="Same Quality Icon" />
              </div>
              <h3>Same Quality Service</h3>
              <p>Ohio customers receive the same high-quality service and attention as our Pennsylvania clients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Need Plumbing Services in Conneaut?</h2>
            <p>Contact MMW Contracting today for fast, reliable service across state lines.</p>
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
