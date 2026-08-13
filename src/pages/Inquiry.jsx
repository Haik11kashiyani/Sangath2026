import { useState } from 'react'
import './Inquiry.css'

function Inquiry() {
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
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thank you for your inquiry! We will contact you soon.')
    setFormData({
      name: '',
      email: '',
      phone: '',
      product: '',
      quantity: '',
      message: ''
    })
  }

  return (
    <div className="inquiry-page">
      <div className="container">
        <h1 className="page-title">Get Inquiry</h1>
        <p className="page-subtitle">
          Fill out the form below and we'll get back to you with a quote
        </p>

        <div className="inquiry-content">
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

            <button type="submit" className="submit-button">
              Submit Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Inquiry

