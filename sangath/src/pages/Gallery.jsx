import './Gallery.css'

function Gallery() {
  const galleryItems = [
    { id: 1, title: 'Product Showcase 1', emoji: '🌾' },
    { id: 2, title: 'Product Showcase 2', emoji: '🌽' },
    { id: 3, title: 'Product Showcase 3', emoji: '🥜' },
    { id: 4, title: 'Product Showcase 4', emoji: '🌿' },
    { id: 5, title: 'Product Showcase 5', emoji: '🌱' },
    { id: 6, title: 'Product Showcase 6', emoji: '🌰' },
  ]

  return (
    <div className="gallery-page">
      <div className="container">
        <h1 className="page-title">Gallery</h1>
        <p className="page-subtitle">Explore our product collection</p>
        <div className="gallery-grid">
          {galleryItems.map((item) => (
            <div key={item.id} className="gallery-item">
              <div className="gallery-image-placeholder">
                <span className="gallery-emoji">{item.emoji}</span>
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

