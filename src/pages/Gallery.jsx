import { useEffect } from 'react'
import './Gallery.css'

function Gallery({ websiteContent }) {
  useEffect(() => {
    if (websiteContent?.general?.siteTitle) {
      document.title = `Gallery - ${websiteContent.general.logoText || 'Sangath Global Exim'}`;
    }
  }, [websiteContent])

  const galleryData = websiteContent?.gallery || {};
  const galleryItems = galleryData.items || [];

  return (
    <div className="gallery-page">
      <div className="container">
        <h1 className="page-title">{galleryData.title || "Gallery"}</h1>
        <p className="page-subtitle">{galleryData.subtitle || "Explore our product collection"}</p>
        <div className="gallery-grid">
          {galleryItems.map((item) => (
            <div key={item.id} className="gallery-item">
              <div className="gallery-image-placeholder">
                <span className="gallery-emoji">{item.emoji || '🌾'}</span>
              </div>
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Gallery
