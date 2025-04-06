import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <img src="/img/mmw-contracting-logo.png" alt="MMW Contracting Logo" className="footer-logo" />
            <p>Professional plumbing services including sewer camera inspection, drain cleaning, and emergency repairs across Pennsylvania and Ohio.</p>
            <div className="footer-contact">
              <p><strong>Phone:</strong> <a href="tel:8142736315">(814) 273-6315</a></p>
              <p><strong>Email:</strong> <a href="mailto:info@mmwcontracting.org">info@mmwcontracting.org</a></p>
            </div>
          </div>
          <div className="footer-services">
            <h3>Our Services</h3>
            <ul>
              <li><Link href="/services/sewer-camera-inspection">Sewer Camera Inspection</Link></li>
              <li><Link href="/services/drain-cleaning">Drain Cleaning & Snaking</Link></li>
              <li><Link href="/services/sewer-line-repair">Sewer Line Repair</Link></li>
              <li><Link href="/services/emergency-plumbing">Emergency Services</Link></li>
              <li><Link href="/services/residential-plumbing">Residential Plumbing</Link></li>
              <li><Link href="/services/commercial-plumbing">Commercial Plumbing</Link></li>
            </ul>
          </div>
          <div className="footer-areas">
            <h3>Service Areas</h3>
            <ul>
              <li><Link href="/service-areas/lake-city-pa">Lake City, PA</Link></li>
              <li><Link href="/service-areas/erie-pa">Erie, PA</Link></li>
              <li><Link href="/service-areas/conneaut-oh">Conneaut, OH</Link></li>
            </ul>
          </div>
          <div className="footer-hours">
            <h3>Business Hours</h3>
            <ul>
              <li><strong>Monday-Friday:</strong> 8:00 AM - 5:00 PM</li>
              <li><strong>Saturday:</strong> 9:00 AM - 2:00 PM</li>
              <li><strong>Sunday:</strong> Closed</li>
              <li><strong>Emergency Services:</strong> 24/7</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MMW Contracting. All Rights Reserved.</p>
          <div className="footer-links">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
