import { MailOpen, Building2, PhoneCall } from 'lucide-react'
import './Footer.css'

function Footer({ setCurrentPage, websiteContent, menuItems = [] }) {
  const currentYear = new Date().getFullYear()

  // Fallbacks from CMS state
  const general = websiteContent?.general || {};
  const brandName = general.logoText || "Sangath Global Exim";
  const address = general.address || "RK Empire, Rajkot, Gujarat, India";
  const email = general.email || "export.sangath@gmail.com";
  const phones = general.phones || ["+91 93137 88416"];
  const socialLinks = general.socialLinks || {};

  const handleNavClick = (item) => {
    if (item.external_url) {
      window.open(item.external_url, '_blank');
      return;
    }
    if (item.page) {
      setCurrentPage(item.page);
    }
  }

  return (
    <footer 
      className="footer"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(8, 13, 23, 0.96), rgba(30, 49, 33, 0.94)), url('${general.footerBackground || '/images/Cumin_Seeds.jpg'}')`,
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      <div className="container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <h3 className="footer-title">{brandName}</h3>
            <h4 className="footer-tagline">Global Trading &amp; Marketing of Agricultural Commodities</h4>
            <p className="footer-description">
              Your trusted partner for global agricultural commodity exports and imports. We connect global markets with quality products and reliable service.
            </p>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              {menuItems.filter(item => item.is_visible).map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleNavClick(link)}
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
                {general.addressIcon ? (
                  <img src={general.addressIcon} alt="Address" className="footer-custom-icon" />
                ) : (
                  <Building2 className="contact-icon" size={18} aria-hidden="true" />
                )}
                <span>{address}</span>
              </div>
              <div className="contact-item">
                {general.phoneIcon ? (
                  <img src={general.phoneIcon} alt="Phone" className="footer-custom-icon" />
                ) : (
                  <PhoneCall className="contact-icon" size={18} aria-hidden="true" />
                )}
                <div className="phones-list">
                  {phones.map((phone, i) => (
                    <a key={i} href={`tel:${phone.replace(/\s+/g, '')}`} className="phone-block">
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
              <div className="contact-item">
                {general.emailIcon ? (
                  <img src={general.emailIcon} alt="Email" className="footer-custom-icon" />
                ) : (
                  <MailOpen className="contact-icon" size={18} aria-hidden="true" />
                )}
                <a href={`mailto:${email}`}>{email}</a>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Follow Us</h3>
            <div className="social-media">
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
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
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Facebook"
                >
                  <svg className="social-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
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
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Twitter / X"
                >
                  <svg className="social-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; {currentYear} {brandName}. All rights reserved.
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
