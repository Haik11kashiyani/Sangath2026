import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import './ProductDetail.css'

function ProductDetail({ product, onBack, categories, onSelectProduct }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const slideshowTimer = useRef(null)

  // Assemble all media items (images and video)
  const mediaItems = [];
  if (product) {
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img && img.trim()) {
          mediaItems.push({ type: 'image', url: img });
        }
      });
    } else if (product.image) {
      mediaItems.push({ type: 'image', url: product.image });
    }
    if (product.video && product.video.trim()) {
      mediaItems.push({ type: 'video', url: product.video });
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    setActiveMediaIndex(0);
  }, [product])

  // Auto-slideshow: cycle through images every 4 seconds (skip video)
  useEffect(() => {
    const imageOnlyItems = mediaItems.filter(m => m.type === 'image');
    if (imageOnlyItems.length <= 1) return;

    slideshowTimer.current = setInterval(() => {
      setActiveMediaIndex(prev => {
        // Find next image-type index
        let next = prev + 1;
        while (next < mediaItems.length && mediaItems[next]?.type !== 'image') {
          next++;
        }
        if (next >= mediaItems.length) {
          // Loop back to first image
          next = mediaItems.findIndex(m => m.type === 'image');
        }
        return next >= 0 ? next : 0;
      });
    }, 4000);

    return () => {
      if (slideshowTimer.current) clearInterval(slideshowTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, mediaItems.length])

  const handleThumbnailClick = (index) => {
    setActiveMediaIndex(index);
    // Reset auto-slideshow timer on manual click
    if (slideshowTimer.current) clearInterval(slideshowTimer.current);
  }

  const handlePrevMedia = () => {
    setActiveMediaIndex(prev => (prev > 0 ? prev - 1 : mediaItems.length - 1));
    if (slideshowTimer.current) clearInterval(slideshowTimer.current);
  }

  const handleNextMedia = () => {
    setActiveMediaIndex(prev => (prev < mediaItems.length - 1 ? prev + 1 : 0));
    if (slideshowTimer.current) clearInterval(slideshowTimer.current);
  }

  // Get all products from the same category for the sidebar
  const currentCategory = categories.find(cat => 
    cat.products && cat.products.some(p => p.id === product?.id)
  )

  const activeMedia = mediaItems[activeMediaIndex] || (product ? { type: 'image', url: product.image } : null);

  // Limit thumbnails to 4 visible
  const visibleThumbnails = mediaItems.slice(0, 4);

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
              <div className="product-main-media">
                {activeMedia && activeMedia.type === 'video' ? (
                  <video controls src={activeMedia.url} className="product-main-video" autoPlay muted />
                ) : (
                  <img src={activeMedia ? activeMedia.url : product.image} alt={product.name} />
                )}
                
                {/* Navigation arrows for slideshow */}
                {mediaItems.length > 1 && (
                  <>
                    <button className="media-nav-btn media-nav-prev" onClick={handlePrevMedia} aria-label="Previous image">
                      <ChevronLeft size={22} />
                    </button>
                    <button className="media-nav-btn media-nav-next" onClick={handleNextMedia} aria-label="Next image">
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
              </div>
              
              {visibleThumbnails.length > 1 && (
                <div className="product-media-gallery">
                  {visibleThumbnails.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`product-thumbnail ${activeMediaIndex === idx ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(idx)}
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
                  {mediaItems.length > 4 && (
                    <div className="product-thumbnail more-indicator">
                      <span>+{mediaItems.length - 4}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="product-details-section">
            <h2>Product Details</h2>
            {product.details && product.details.length > 0 ? (
              product.details.map((detail, idx) => (
                <div key={idx} className="detail-block">
                  {detail.type === 'text' && (
                    <>
                      {detail.title && <h4>{detail.title}</h4>}
                      <div className="detail-text-block">
                        <p>{detail.content}</p>
                      </div>
                    </>
                  )}
                  {detail.type === 'list' && (
                    <>
                      {detail.title && <h4>{detail.title}</h4>}
                      <ul className="detail-list">
                        {detail.items && detail.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="no-details-text">No additional details available for this product.</p>
            )}
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
                      <td data-label="Varieties">{spec.variety}</td>
                      <td data-label="Origin">{spec.origin}</td>
                      <td data-label="Specification">{spec.specification}</td>
                      <td data-label="Packaging">{spec.packaging}</td>
                      <td data-label="FCL 20'">{spec.fcl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar - Category Navigation Only */}
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
        </aside>
      </div>
    </div>
  )
}

export default ProductDetail



