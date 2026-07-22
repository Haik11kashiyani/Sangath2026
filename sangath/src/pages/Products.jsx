import { useEffect, useRef, useState } from 'react'
import { API_URL } from '../config/runtime.js'
import { supabase, hasSupabase } from '../config/supabaseClient.js'
import './Products.css'

function Products({ setCurrentPage, onViewDetails }) {
  const categoryRefs = useRef({})
  const [categories, setCategories] = useState([])

  // Set page title
  useEffect(() => {
    document.title = 'Products - Sangath Global Exim | Agricultural Commodities'
  }, [])

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = hasSupabase
          ? await (async () => {
              const { data: supaData, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true })

              if (error) throw error
              return supaData || []
            })()
          : await fetch(`${API_URL}/products`).then(res => res.json())

        const products = (Array.isArray(data) ? data : []).map(product => ({
          ...product,
          image: product.image || product.image_url || ''
        }))

        const groups = {}
        products.forEach(product => {
          const categoryKey = product.category_name || product.category_slug || product.category_id || 'uncategorized'
          if (!groups[categoryKey]) {
            groups[categoryKey] = {
              id: categoryKey,
              name: product.category_name || product.category_slug || (categoryKey === 'uncategorized' ? 'General' : `Category ${String(categoryKey).substring(0, 8)}`),
              products: []
            }
          }
          groups[categoryKey].products.push(product)
        })

        setCategories(Object.values(groups))
      } catch (err) {
        console.error('Failed to load products from API or Supabase', err)
      }
    }

    loadProducts()
  }, [])

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

  return (
    <div className="products-page">
      <div className="page-header">
        <div className="container">
          <h1>Our Products</h1>
          <p className="page-subtitle">
            Premium Agricultural Commodities for Global Markets
          </p>
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
              {category.products.map((product) => (
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

                    {product.price && (
                      <p className="product-price">₹ {product.price}</p>
                    )}

                    <div className="product-footer">
                      <button
                        className="btn-inquire"
                        onClick={() => onViewDetails ? onViewDetails(product) : (setCurrentPage && setCurrentPage('contact'))}
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
          <div className="cta-box">
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
