import { MailOpen, Building2, PhoneCall, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { sanitizeInput } from '../utils/security'
import { submitInquiryApi } from '../utils/api'
import './Contact.css'

function Contact({ websiteContent, onRefreshInquiries }) {
  const [loading, setLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // { type: 'success' | 'error', message: string }

  useEffect(() => {
    if (websiteContent?.general?.siteTitle) {
      document.title = `Contact Us - ${websiteContent.general.logoText || 'Sangath Global Exim'}`;
    }
  }, [websiteContent])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (submitStatus) setSubmitStatus(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSubmitStatus(null)

    try {
      const cleanName = sanitizeInput(formData.name);
      const cleanEmail = sanitizeInput(formData.email);
      const cleanPhone = sanitizeInput(formData.phone);
      const cleanSubject = sanitizeInput(formData.subject);
      const cleanMessage = sanitizeInput(formData.message);

      if (!cleanName || !cleanName.trim()) {
        throw new Error('Please enter your full name');
      }

      await submitInquiryApi({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage
      });

      if (onRefreshInquiries) onRefreshInquiries();

      setSubmitStatus({
        type: 'success',
        message: 'Thank you for reaching out! Your inquiry has been sent to our team.'
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error('Inquiry submit error:', err);
      setSubmitStatus({
        type: 'error',
        message: err.message || 'An error occurred while sending your message. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }

  const general = websiteContent?.general || {};
  const address = general.address || "RK Empire, Rajkot, Gujarat, India";
  const email = general.email || "export.sangath@gmail.com";
  const phones = general.phones || ["+91 93137 88416"];

  const header = websiteContent?.contact?.header || {
    title: "Contact Us",
    subtitle: `Get In Touch With ${general.logoText || "Sangath Global Exim"}`,
    bannerImage: "/images/Cumin_Seeds.jpg"
  };

  // Build clean, working Google Maps embed URL
  const customMapEmbed = websiteContent?.contact?.mapEmbedUrl || general.mapEmbedUrl || '';
  let mapSrc = '';
  if (customMapEmbed && typeof customMapEmbed === 'string') {
    const match = customMapEmbed.match(/src=["']([^"']+)["']/i);
    mapSrc = match ? match[1] : customMapEmbed.trim();
  }
  if (!mapSrc) {
    mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }
  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="contact-page">
      <div 
        className={`page-header ${header.bannerVideo ? 'has-bg-video' : ''}`}
        style={{
          backgroundImage: (!header.bannerVideo && (header.bannerImage || '/images/Cumin_Seeds.jpg'))
            ? `linear-gradient(135deg, rgba(5, 9, 17, 0.92), rgba(38, 50, 65, 0.84)), url('${header.bannerImage || '/images/Cumin_Seeds.jpg'}')`
            : undefined,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        {header.bannerVideo && (
          <video
            src={header.bannerVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="section-bg-video"
            poster={header.bannerImage || undefined}
          />
        )}
        <div className="container">
          <h1>{header.title}</h1>
          <p className="page-subtitle">{header.subtitle}</p>
        </div>
      </div>

      <div className="container">
        {/* Contact Info */}
        <section className="contact-info-section">
          <div className="contact-info-grid">
            <div className="info-card">
              <div className="info-icon">
                {general.addressIcon ? (
                  <img src={general.addressIcon} alt="Address Icon" className="contact-custom-icon" />
                ) : (
                  <Building2 size={30} aria-hidden="true" />
                )}
              </div>
              <h3>Office Address</h3>
              <p>{address}</p>
            </div>
            <div className="info-card">
              <div className="info-icon">
                {general.phoneIcon ? (
                  <img src={general.phoneIcon} alt="Phone Icon" className="contact-custom-icon" />
                ) : (
                  <PhoneCall size={30} aria-hidden="true" />
                )}
              </div>
              <h3>Phone</h3>
              {phones.map((phone, i) => (
                <p key={i}>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</a>
                </p>
              ))}
            </div>
            <div className="info-card">
              <div className="info-icon">
                {general.emailIcon ? (
                  <img src={general.emailIcon} alt="Email Icon" className="contact-custom-icon" />
                ) : (
                  <MailOpen size={30} aria-hidden="true" />
                )}
              </div>
              <h3>Email</h3>
              <p>
                <a href={`mailto:${email}`}>{email}</a>
              </p>
            </div>
          </div>
        </section>

        {/* Map and Form Section */}
        <section className="map-form-section">
          <div className="map-form-grid">
            {/* Google Map */}
            <div className="map-container">
              <div className="map-title-row">
                <h2>Find Us</h2>
                <a 
                  href={googleMapsDirectionsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-directions-link"
                  title="Open location in Google Maps"
                >
                  <MapPin size={16} aria-hidden="true" />
                  <span>Get Directions</span>
                </a>
              </div>
              <div className="map-placeholder">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${general.logoText || 'Sangath Global Exim'} Location Map`}
                ></iframe>
              </div>
              <div className="map-address-banner">
                <MapPin size={18} className="map-pin-icon" aria-hidden="true" />
                <span className="map-address-text">{address}</span>
              </div>
            </div>

            {/* Contact Form */}
            <div className="form-container">
              <h2>Send Us a Message</h2>

              {submitStatus && (
                <div className={`contact-status-banner ${submitStatus.type}`}>
                  {submitStatus.type === 'success' ? (
                    <CheckCircle2 size={20} className="status-icon" />
                  ) : (
                    <AlertCircle size={20} className="status-icon" />
                  )}
                  <span>{submitStatus.message}</span>
                </div>
              )}

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="What is this regarding?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your message..."
                  ></textarea>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className="business-hours-section">
          <div className="hours-card">
            <h2>Business Hours</h2>
            <div className="hours-list">
              <div className="hours-item">
                <span className="day">Monday - Friday</span>
                <span className="time">9:00 AM - 6:00 PM</span>
              </div>
              <div className="hours-item">
                <span className="day">Saturday</span>
                <span className="time">9:00 AM - 2:00 PM</span>
              </div>
              <div className="hours-item">
                <span className="day">Sunday</span>
                <span className="time">Closed</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Contact
