import { MailOpen, Building2, PhoneCall } from 'lucide-react'
import { useEffect, useState } from 'react'
import { sanitizeInput } from '../utils/security'
import { submitInquiryApi } from '../utils/api'
import './Contact.css'

function Contact({ websiteContent, onRefreshInquiries }) {
  const [loading, setLoading] = useState(false)

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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const cleanName = sanitizeInput(formData.name);
      const cleanEmail = sanitizeInput(formData.email);
      const cleanPhone = sanitizeInput(formData.phone);
      const cleanSubject = sanitizeInput(formData.subject);
      const cleanMessage = sanitizeInput(formData.message);

      await submitInquiryApi({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage
      });

      if (onRefreshInquiries) onRefreshInquiries();

      alert('Thank you for reaching out! Your inquiry has been sent to our team.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      alert(err.message || 'An error occurred while sending your message.');
    } finally {
      setLoading(false);
    }
  }

  // Extract contact info from CMS
  const general = websiteContent?.general || {};
  const address = general.address || "RK Empire, Rajkot, Gujarat, India";
  const email = general.email || "export.sangath@gmail.com";
  const phones = general.phones || ["+91 93137 88416"];

  const header = websiteContent?.contact?.header || {
    title: "Contact Us",
    subtitle: `Get In Touch With ${general.logoText || "Sangath Global Exim"}`,
    bannerImage: "/images/Cumin_Seeds.jpg"
  };

  return (
    <div className="contact-page">
      <div 
        className="page-header"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(5, 9, 17, 0.92), rgba(38, 50, 65, 0.84)), url('${header.bannerImage || '/images/Cumin_Seeds.jpg'}')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
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
              <h2>Find Us</h2>
              <div className="map-placeholder">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.0!2d88.3631!3d22.5726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDM0JzIxLjQiTiA4OMKwMjEnNDcuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sangath Global Exim Location"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="form-container">
              <h2>Send Us a Message</h2>
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

                <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Sending..." : "Send Message"}</button>
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
