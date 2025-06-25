import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <>
      <header className="header">
        <div className="top-bar">
          <div className="container">
            <div className="contact-info">
              <span>Serving Erie County, PA | Lake City, PA | Conneaut, OH</span>
              <a href="tel:8142736315" className="phone-number">(814) 273-6315</a>
            </div>
          </div>
        </div>
        <nav className="main-nav">
          <div className="container">
            <div className="logo">
              <Link href="/">
                <img src="/logo.svg" alt="Marfinetz Plumbing Logo" /
                

              </Link>
            </div>
            <ul className="nav-links">
              <li><Link href="/">Home</Link></li>
              <li className="dropdown">
                <Link href="/services">Services</Link>
                <ul className="dropdown-menu">
                  <li><Link href="/services/sewer-camera-inspection">Sewer Camera Inspection</Link></li>
                  <li><Link href="/services/drain-cleaning">Drain Cleaning & Snaking</Link></li>
                  <li><Link href="/services/sewer-line-repair">Sewer Line Repair</Link></li>
                  <li><Link href="/services/emergency-plumbing">Emergency Services</Link></li>
                  <li><Link href="/services/residential-plumbing">Residential Plumbing</Link></li>
                  <li><Link href="/services/commercial-plumbing">Commercial Plumbing</Link></li>
                </ul>
              </li>
              <li className="dropdown">
                <Link href="/service-areas">Service Areas</Link>
                <ul className="dropdown-menu">
                  <li><Link href="/service-areas/lake-city-pa">Lake City, PA</Link></li>
                  <li><Link href="/service-areas/erie-pa">Erie, PA</Link></li>
                  <li><Link href="/service-areas/conneaut-oh">Conneaut, OH</Link></li>
                </ul>
              </li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/reviews">Reviews</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
            <div className="cta-button">
              <Link href="/contact" className="btn btn-primary">Request Service</Link>
            </div>
            <div className="mobile-menu-toggle">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </nav>
      </header>

      <div className="emergency-banner">
        <div className="container">
          <div className="emergency-content">
            <div className="emergency-icon">
              <img src="/img/emergency-icon.png" alt="Emergency Plumbing" />
            </div>
            <div className="emergency-text">
              <h2>24/7 Emergency Plumbing Services</h2>
              <p>Available in Erie County, Lake City, and Conneaut</p>
            </div>
            <div className="emergency-cta">
              <a href="tel:8142736315" className="btn btn-emergency">Call Now: (814) 273-6315</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
