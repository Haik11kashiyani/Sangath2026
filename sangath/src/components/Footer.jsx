import { Mail, MapPin, Phone } from 'lucide-react'
import './Footer.css'

function Footer({ setCurrentPage }) {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { id: 'home', label: 'Home', page: 'home' },
    { id: 'about', label: 'About Us', page: 'about' },
    { id: 'products', label: 'Products', page: 'products' },
    { id: 'exports-imports', label: 'Exports / Imports', page: 'exports-imports' },
    { id: 'quality', label: 'Quality', page: 'quality' },
    { id: 'contact', label: 'Contact Us', page: 'contact' },
    { id: 'blog', label: 'Blog', page: 'blog' },
    { id: 'careers', label: 'Careers', page: 'careers' }
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <h3 className="footer-title">Sangath Global Exim</h3>
            <p className="footer-tagline">Global Trading &amp; Marketing of Agricultural Commodities</p>
            <p className="footer-description">
              Your trusted partner for global agricultural commodity exports and imports.
              We connect global markets with quality products and reliable service.
            </p>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => setCurrentPage(link.page)}
                    className="footer-link"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Contact Us</h3>
            <div className="footer-contact">
              <div className="contact-item">
                <MapPin className="contact-icon" size={18} aria-hidden="true" />
                <span>RK Empire, Rajkot, Gujarat, India</span>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" size={18} aria-hidden="true" />
                <a href="tel:+919313788416">+91 93137 88416</a>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" size={18} aria-hidden="true" />
                <a href="tel:+918780044296">+91 87800 44296</a>
              </div>
              <div className="contact-item">
                <Mail className="contact-icon" size={18} aria-hidden="true" />
                <a href="mailto:export.sangath@gmail.com">export.sangath@gmail.com</a>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Follow Us</h3>
            <div className="social-media">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn"
              >
                <svg className="social-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Facebook"
              >
                <svg className="social-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram"
              >
                <svg className="social-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Twitter / X"
              >
                <svg className="social-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; {currentYear} Sangath Global Exim. All rights reserved.
            </p>
            <div className="footer-legal">
              <button
                className="legal-link"
                onClick={() => setCurrentPage('contact')}
              >
                Privacy Policy
              </button>
              <span className="separator">|</span>
              <button
                className="legal-link"
                onClick={() => setCurrentPage('contact')}
              >
                Terms &amp; Conditions
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
