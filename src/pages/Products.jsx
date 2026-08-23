import { useEffect, useRef } from 'react'
import './Products.css'

function Products({ setCurrentPage, onViewDetails, categories, websiteContent }) {
  const categoryRefs = useRef({})

  // Sync title and listen to search details trigger
  useEffect(() => {
    if (websiteContent?.general?.siteTitle) {
      document.title = `Products - ${websiteContent.general.logoText || 'Sangath Global Exim'}`;
    }

    const handleSearchView = (e) => {
      if (e.detail && onViewDetails) {
        onViewDetails(e.detail);
      }
    };
    
    window.addEventListener('sangath_view_product', handleSearchView);
    return () => window.removeEventListener('sangath_view_product', handleSearchView);
  }, [websiteContent, onViewDetails])

  const scrollToCategory = (categoryId) => {
    const element = categoryRefs.current[categoryId]
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const header = websiteContent?.products?.header || {
    title: "Our Products",
    subtitle: "Premium Agricultural Commodities for Global Markets",
    bannerImage: "/images/Cumin_Seeds.jpg"
  };

  return (
    <div className="products-page">
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

        {/* Category Navigation */}
        <nav className="category-nav" aria-label="Product categories">
          <ul className="category-nav-list">
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  className="category-nav-link"
                  onClick={() => scrollToCategory(category.id)}
                  aria-label={`Navigate to ${category.name} section`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Products by Category */}
        {categories.map((category) => (
          <section
            key={category.id}
            id={category.id}
            ref={(el) => (categoryRefs.current[category.id] = el)}
            className="category-section"
            aria-labelledby={`category-${category.id}`}
          >
            <h2 id={`category-${category.id}`} className="category-title">
              {category.name}
            </h2>

            <div className="products-grid" role="list">
              {category.products && category.products.map((product) => (
                <article
                  key={product.id}
                  className="product-card"
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${product.name}, ${product.description}`}
                >
                  <div className="product-image">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">
                      {product.description}
                    </p>

                    {/* Price visibility controlled by admin toggle */}
                    {websiteContent?.products?.showPrices !== false && product.price && (
                      <p className="product-price">₹ {product.price}</p>
                    )}

                    <div className="product-footer">
                      <button
                        className="btn-inquire"
                        onClick={() => {
                          if (onViewDetails) {
                            // Ensure the product holds the categoryId for the detail sidebar logic
                            onViewDetails({ ...product, categoryId: category.id });
                          } else {
                            setCurrentPage('contact');
                          }
                        }}
                        aria-label={`Inquire about ${product.name}`}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* Call to Action */}
        <section className="products-cta">
          <div 
            className="cta-box"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(5, 9, 17, 0.94), rgba(38, 50, 65, 0.88)), url('${websiteContent?.products?.cta?.bannerImage || '/images/turmeric_powder.jpg'}')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          >
            <h2>Looking for Bulk Orders?</h2>
            <p>Contact us for competitive pricing and customized solutions</p>
            <button
              className="btn-contact"
              onClick={() => setCurrentPage && setCurrentPage('contact')}
            >
              Contact Us
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Products
