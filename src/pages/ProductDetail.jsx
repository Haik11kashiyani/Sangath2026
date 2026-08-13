import { useState, useEffect } from 'react'
import { ArrowLeft, Briefcase, Check } from 'lucide-react'
import { sanitizeInput } from '../utils/security'
import { submitInquiryApi } from '../utils/api'
import './ProductDetail.css'

function ProductDetail({ product, onBack, categories, onSelectProduct, websiteContent, onRefreshInquiries }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    country: '',
    courier: '',
    message: ''
  })
  
  const [isInCart, setIsInCart] = useState(false)
  const [activeMedia, setActiveMedia] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    
    if (product) {
      // Set initial active media to the main product image
      setActiveMedia({ type: 'image', url: product.image });
    }
    
    // Check if product is in the inquiry cart
    try {
      if (product) {
        const cart = JSON.parse(localStorage.getItem('sangath_inquiry_cart') || '[]');
        setIsInCart(cart.includes(product.id));
      }
    } catch (e) {
      setIsInCart(false);
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleToggleCart = () => {
    if (!product) return;
    try {
      const cart = JSON.parse(localStorage.getItem('sangath_inquiry_cart') || '[]');
      let updatedCart = [];
      
      if (cart.includes(product.id)) {
        updatedCart = cart.filter(id => id !== product.id);
        setIsInCart(false);
      } else {
        updatedCart = [...cart, product.id];
        setIsInCart(true);
      }
      
      localStorage.setItem('sangath_inquiry_cart', JSON.stringify(updatedCart));
      // Dispatch event to sync header count
      window.dispatchEvent(new Event('sangath_cart_updated'));
    } catch (e) {
      console.error('Error modifying inquiry cart', e);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!product) return;

    try {
      // 1. Sanitize input fields
      const name = sanitizeInput(formData.name);
      const company = sanitizeInput(formData.company);
      const country = sanitizeInput(formData.country);
      const courier = sanitizeInput(formData.courier);
      const message = sanitizeInput(formData.message);

      // 2. Save sample request via API
      await submitInquiryApi({
        name,
        company,
        country,
        courier,
        product: product.name,
        subject: `Sample Request for ${product.name}`,
        message
      });

      if (onRefreshInquiries) onRefreshInquiries();

      alert(`Thank you for your sample request for ${product.name}. We will process this and contact you soon!`)
      
      setFormData({
        name: '',
        company: '',
        country: '',
        courier: '',
        message: ''
      })
    } catch (err) {
      alert(err.message || 'Failed to submit sample request. Please try again.');
    }
  }

  // Get all products from the same category for the sidebar
  const currentCategory = categories.find(cat => 
    cat.products && cat.products.some(p => p.id === product?.id)
  )

  // Assemble all media items (images and video)
  const mediaItems = [];
  if (product) {
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        mediaItems.push({ type: 'image', url: img });
      });
    } else if (product.image) {
      mediaItems.push({ type: 'image', url: product.image });
    }
    if (product.video) {
      mediaItems.push({ type: 'video', url: product.video });
    }
  }

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
          
          <div className="product-title-action-header">
            <h1 className="product-detail-title">{product.name}</h1>
            <button 
              className={`btn-add-inquiry-list ${isInCart ? 'added' : ''}`}
              onClick={handleToggleCart}
              title={isInCart ? "Remove from Inquiry List" : "Add to Inquiry List for Bulk Quote"}
            >
              {isInCart ? <Check size={16} /> : <Briefcase size={16} />}
              {isInCart ? "Added to Inquiry List" : "Add to Inquiry List"}
            </button>
          </div>
          
          <div className="product-top-section">
            <div className="product-detail-description">
              <p>{product.description}</p>
              {product.details && product.details.map((detail, idx) => (
                detail.type === 'text' && idx === 0 ? null : // Skip first text if it's identical to description
                detail.type === 'text' && <p key={idx}>{detail.content}</p>
              ))}
            </div>
            
            <div className="product-detail-image">
              <div className="product-main-media">
                {activeMedia && activeMedia.type === 'video' ? (
                  <video controls src={activeMedia.url} className="product-main-video" autoPlay muted />
                ) : (
                  <img src={activeMedia ? activeMedia.url : product.image} alt={product.name} />
                )}
              </div>
              
              {mediaItems.length > 1 && (
                <div className="product-media-gallery">
                  {mediaItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`product-thumbnail ${activeMedia && activeMedia.url === item.url ? 'active' : ''}`}
                      onClick={() => setActiveMedia(item)}
                    >
                      {item.type === 'video' ? (
                        <>
                          <div className="video-thumbnail-overlay">
                            <span>▶ Video</span>
                          </div>
                          <img src={product.image} alt="Video thumbnail preview" />
                        </>
                      ) : (
                        <img src={item.url} alt={`Thumbnail ${idx + 1}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                    placeholder="Message / Details..." 
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
