import { useState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { sanitizeInput } from '../utils/security'
import { submitInquiryApi } from '../utils/api'
import './Inquiry.css'

function Inquiry({ websiteContent, onRefreshInquiries }) {
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null) // { type: 'success' | 'error', message: string }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    product: '',
    quantity: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (statusMsg) setStatusMsg(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatusMsg(null)

    try {
      const cleanName = sanitizeInput(formData.name)
      const cleanEmail = sanitizeInput(formData.email)
      const cleanPhone = sanitizeInput(formData.phone)
      const cleanProduct = sanitizeInput(formData.product)
      const cleanQuantity = sanitizeInput(formData.quantity)
      const cleanMessage = sanitizeInput(formData.message)

      if (!cleanName || !cleanName.trim()) {
        throw new Error('Please enter your full name')
      }

      await submitInquiryApi({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        product: cleanProduct,
        quantity: cleanQuantity,
        subject: cleanProduct ? `Product Inquiry: ${cleanProduct}` : 'General Product Inquiry',
        message: cleanMessage
      })

      if (onRefreshInquiries) onRefreshInquiries()

      setStatusMsg({
        type: 'success',
        message: 'Thank you for your inquiry! Our export team will review your requirements and get back to you shortly.'
      })
      setFormData({
        name: '',
        email: '',
        phone: '',
        product: '',
        quantity: '',
        message: ''
      })
    } catch (err) {
      console.error('Inquiry submission error:', err)
      setStatusMsg({
        type: 'error',
        message: err.message || 'An error occurred while submitting your inquiry. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inquiry-page">
      <div className="container">
        <h1 className="page-title">Get Inquiry</h1>
        <p className="page-subtitle">
          Fill out the form below and we'll get back to you with a quote
        </p>

        <div className="inquiry-content">
          {statusMsg && (
            <div className={`contact-status-banner ${statusMsg.type}`} style={{ marginBottom: '1.5rem' }}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 size={20} className="status-icon" />
              ) : (
                <AlertCircle size={20} className="status-icon" />
              )}
              <span>{statusMsg.message}</span>
            </div>
          )}

          <form className="inquiry-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Full Name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
              <div className="form-group">
                <label htmlFor="product">Product Interest *</label>
                <select
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a product</option>
                  <option value="onion-flakes">Onion Flakes</option>
                  <option value="garlic-flakes">Garlic Flakes</option>
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice</option>
                  <option value="pulses">Pulses</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity Required</label>
              <input
                type="text"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g., 1000 kg, 50 tons"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Additional Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Tell us more about your requirements..."
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Submitting Inquiry..." : "Submit Inquiry"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Inquiry

