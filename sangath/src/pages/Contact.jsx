import { Mail, MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { API_URL } from '../config/runtime.js'
import { supabase, hasSupabase } from '../config/supabaseClient.js'
import './Contact.css'


function Contact() {

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Contact Us - Sangath Global Exim | Get In Touch'
  }, [])

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

  // const handleSubmit = (e) => {
  //   e.preventDefault()
  //   // Handle form submission
  //   alert('Thank you for your message! We will contact you soon.')
  //   setFormData({
  //     name: '',
  //     email: '',
  //     phone: '',
  //     subject: '',
  //     message: ''
  //   })
  // }

const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  try {
    if (hasSupabase) {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject || null,
        message: formData.message
      }

      const { error } = await supabase.from('contact_submissions').insert([payload])
      if (error) throw error

      alert("Thank you! Your message has been sent successfully.")
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } else {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message
        })
      })

      if (response.ok) {
        alert("Thank you! Your message has been sent successfully.")
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        const error = await response.json()
        alert(error.error || "Error sending message. Please try again.")
      }
    }
  } catch (error) {
    console.error('Error:', error)
    alert("Error sending message. Please check your connection and try again.")
  }

  setLoading(false)
}

  return (
    <div className="contact-page">
      <div className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p className="page-subtitle">Get In Touch With Sangath Global Exim</p>
        </div>
      </div>

      <div className="container">
        {/* Contact Info */}
        <section className="contact-info-section">
          <div className="contact-info-grid">
            <div className="info-card">
              <div className="info-icon"><MapPin size={30} aria-hidden="true" /></div>
              <h3>Office Address</h3>
              <p>RK Prime</p>
              <p>Rajkot, Gujarat, India</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><Phone size={30} aria-hidden="true" /></div>
              <h3>Phone</h3>
              <p>
                <a href="tel:+919313788416">+91 93137 88416</a>
              </p>
              <p>
                <a href="tel:+918780044296">+91 87800 44296</a>
              </p>
            </div>
            <div className="info-card">
              <div className="info-icon"><Mail size={30} aria-hidden="true" /></div>
              <h3>Email</h3>
              <p>
              {/*  <a href="export.sangath@gmail.com">export.sangath@gmail.com</a> */}
              <a href="mailto:export.sangath@gmail.com">export.sangath@gmail.com</a>
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
