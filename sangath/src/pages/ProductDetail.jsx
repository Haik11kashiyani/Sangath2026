import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import './ProductDetail.css'

function ProductDetail({ product, onBack, categories, onSelectProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    country: '',
    courier: '',
    message: ''
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thank you for your inquiry. We will get back to you soon!')
    setFormData({
      name: '',
      company: '',
      country: '',
      courier: '',
      message: ''
    })
  }

  // Get all products from the same category for the sidebar
  const currentCategory = categories.find(cat => 
    cat.products.some(p => p.id === product.id)
  )

  if (!product) return null

  return (
    <div className="product-detail-page">
      <div className="container product-detail-container">
        {/* Main Content */}
        <div className="product-main-content">
          <button className="back-to-products" onClick={onBack}>
            <ArrowLeft size={18} aria-hidden="true" />
            Back to Products
          </button>
          
          <h1 className="product-detail-title">{product.name}</h1>
          
          <div className="product-top-section">
            <div className="product-detail-description">
              <p>{product.description}</p>
              {product.details && product.details.map((detail, idx) => (
                detail.type === 'text' && idx === 0 ? null : // Skip first text if it's identical to description
                detail.type === 'text' && <p key={idx}>{detail.content}</p>
              ))}
            </div>
            <div className="product-detail-image">
              <img src={product.image} alt={product.name} />
            </div>
          </div>

          <div className="product-details-section">
            <h2>Product Details</h2>
            {product.details && product.details.map((detail, idx) => (
              <div key={idx} className="detail-block">
                {detail.type === 'list' && (
                  <>
                    {detail.title && <h4>{detail.title}</h4>}
                    <ul className="detail-list">
                      {detail.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>

          {product.specifications && product.specifications.length > 0 && (
            <div className="spec-table-container">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Varieties</th>
                    <th>Origin</th>
                    <th>Specification</th>
                    <th>Packaging</th>
                    <th>FCL 20'</th>
                  </tr>
                </thead>
                <tbody>
                  {product.specifications.map((spec, idx) => (
                    <tr key={idx}>
                      <td>{spec.variety}</td>
                      <td>{spec.origin}</td>
                      <td>{spec.specification}</td>
                      <td>{spec.packaging}</td>
                      <td>{spec.fcl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="product-sidebar">
          {currentCategory && (
            <div className="sidebar-widget">
              <h3 className="widget-title">{currentCategory.name}</h3>
              <ul className="product-links-list">
                {currentCategory.products.map(p => (
                  <li key={p.id}>
                    <button 
                      className={p.id === product.id ? 'active' : ''}
                      onClick={() => onSelectProduct(p)}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="sidebar-widget">
            <h3 className="widget-title">Sample Request</h3>
            <div className="sample-request-form">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Name..." 
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="company" 
                    placeholder="Company Name..." 
                    value={formData.company}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="country" 
                    placeholder="Country Name..." 
                    value={formData.country}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="courier" 
                    placeholder="Courier Account Number..." 
                    value={formData.courier}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <textarea 
                    name="message" 
                    placeholder="msg" 
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn-submit-request">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ProductDetail
