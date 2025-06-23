import React from 'react';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Professional Sewer Camera Inspection & Plumbing Services</h1>
            <p className="hero-subtitle">Serving Erie County, Lake City PA, and Conneaut OH</p>
            <p className="hero-description">Find and fix plumbing problems fast with our state-of-the-art sewer camera inspection services. No guesswork, no unnecessary digging.</p>
            <div className="hero-cta">
              <a href="/services/sewer-camera-inspection" className="btn btn-primary">Learn About Sewer Inspection</a>
              <a href="/contact" className="btn btn-secondary">Request Service</a>
            </div>
          </div>
          <div className="hero-image">
            <img src="/img/sewer-camera-inspection.jpg" alt="Sewer Camera Inspection Service" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="container">
          <div className="section-header">
            <h2>Our Plumbing Services</h2>
            <p>Professional solutions for all your plumbing needs</p>
          </div>
          <div className="services-grid">
            {/* Sewer Camera Inspection Card */}
            <div className="service-card featured">
              <div className="service-icon">
                <img src="/img/camera-icon.png" alt="Sewer Camera Icon" />
              </div>
              <h3>Sewer Camera Inspection</h3>
              <p>Identify blockages, cracks, and other issues without destructive digging. Our high-definition cameras provide accurate diagnosis of your sewer line problems.</p>
              <ul className="service-features">
                <li>Locate blockages and breaks</li>
                <li>Identify tree root intrusions</li>
                <li>Verify proper pipe installation</li>
                <li>Document pipe condition</li>
              </ul>
              <a href="/services/sewer-camera-inspection" className="btn btn-outline">Learn More</a>
            </div>
            
            {/* Drain Cleaning Card */}
            <div className="service-card">
              <div className="service-icon">
                <img src="/img/drain-icon.png" alt="Drain Cleaning Icon" />
              </div>
              <h3>Drain Cleaning & Snaking</h3>
              <p>Professional solutions for clogged drains and sewer lines. We use specialized equipment to clear blockages quickly and effectively.</p>
              <a href="/services/drain-cleaning" className="btn btn-outline">Learn More</a>
            </div>
            
            {/* Sewer Line Repair Card */}
            <div className="service-card">
              <div className="service-icon">
                <img src="/img/pipe-icon.png" alt="Sewer Line Repair Icon" />
              </div>
              <h3>Sewer Line Repair</h3>
              <p>Expert repair and replacement services for damaged sewer lines, including trenchless options to minimize disruption.</p>
              <a href="/services/sewer-line-repair" className="btn btn-outline">Learn More</a>
            </div>
            
            {/* Emergency Services Card */}
            <div className="service-card">
              <div className="service-icon">
                <img src="/img/emergency-icon.png" alt="Emergency Plumbing Icon" />
              </div>
              <h3>Emergency Plumbing</h3>
              <p>24/7 emergency service for burst pipes, major leaks, sewer backups, and other plumbing emergencies.</p>
              <a href="/services/emergency-plumbing" className="btn btn-outline">Learn More</a>
            </div>
            
            {/* View All Services Button */}
            <div className="view-all">
              <a href="/services" className="btn btn-primary">View All Services</a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Marfinetz Plumbing</h2>
            <p>Trusted plumbing professionals serving the tri-state area</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/location-icon.png" alt="Service Area Icon" />
              </div>
              <h3>Tri-Market Service Area</h3>
              <p>Serving Lake City, Erie, and Conneaut with fast, reliable service across state lines.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/experience-icon.png" alt="Experience Icon" />
              </div>
              <h3>Experienced Technicians</h3>
              <p>Our licensed professionals have the expertise to handle any plumbing challenge.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/pricing-icon.png" alt="Pricing Icon" />
              </div>
              <h3>Transparent Pricing</h3>
              <p>Upfront, honest pricing with no hidden fees or surprise charges.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <img src="/img/guarantee-icon.png" alt="Guarantee Icon" />
              </div>
              <h3>Satisfaction Guaranteed</h3>
              <p>We stand behind our work with a 100% satisfaction guarantee on all services.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="service-areas">
        <div className="container">
          <div className="section-header">
            <h2>Our Service Areas</h2>
            <p>Providing quality plumbing services across Pennsylvania and Ohio</p>
          </div>
          <div className="areas-grid">
            <div className="area-card">
              <div className="area-image">
                <img src="/img/lake-city-pa.jpg" alt="Lake City, PA" />
              </div>
              <h3>Lake City, PA</h3>
              <p>Our home base, providing fast response times throughout Lake City and surrounding areas.</p>
              <a href="/service-areas/lake-city-pa" className="btn btn-outline">Lake City Services</a>
            </div>
            <div className="area-card">
              <div className="area-image">
                <img src="/img/erie-pa.jpg" alt="Erie, PA" />
              </div>
              <h3>Erie, PA</h3>
              <p>Comprehensive plumbing services throughout Erie County, including sewer camera inspections.</p>
              <a href="/service-areas/erie-pa" className="btn btn-outline">Erie Services</a>
            </div>
            <div className="area-card">
              <div className="area-image">
                <img src="/img/conneaut-oh.jpg" alt="Conneaut, OH" />
              </div>
              <h3>Conneaut, OH</h3>
              <p>Cross-border service for our Ohio neighbors with the same quality and reliability.</p>
              <a href="/service-areas/conneaut-oh" className="btn btn-outline">Conneaut Services</a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Customers Say</h2>
            <p>Read reviews from satisfied customers across our service areas</p>
          </div>
          <div className="testimonials-slider">
            {/* Testimonial 1 */}
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">"Marfinetz Plumbing saved us thousands in unnecessary repairs. Their sewer camera inspection identified the exact location of our problem, and they fixed it the same day."</p>
              <div className="testimonial-author">
                <p className="author-name">John D.</p>
                <p className="author-location">Erie, PA</p>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">"Fast response time and professional service. They used their camera to find a toy my child flushed down the toilet and retrieved it without damaging our pipes."</p>
              <div className="testimonial-author">
                <p className="author-name">Sarah M.</p>
                <p className="author-location">Lake City, PA</p>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">"Even though I'm in Ohio, MMW Contracting came out quickly when I had a sewer backup. Their camera inspection found tree roots, and they cleared them completely."</p>
              <div className="testimonial-author">
                <p className="author-name">Robert T.</p>
                <p className="author-location">Conneaut, OH</p>
              </div>
            </div>
          </div>
          <div className="testimonials-cta">
            <a href="/reviews" className="btn btn-secondary">Read More Reviews</a>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Need Sewer Line Inspection or Plumbing Services?</h2>
            <p>Contact Marfinetz Plumbing today for fast, reliable service across Erie County, Lake City, and Conneaut.</p>
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
