import { useEffect, useState } from 'react'
import { API_URL } from '../config/runtime.js'
import './Product.css'

function Product() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        const groups = {}
        if (Array.isArray(data)) {
          data.forEach(product => {
            const categoryId = product.category_id || 'uncategorized'
            if (!groups[categoryId]) {
              groups[categoryId] = {
                id: categoryId,
                name: categoryId === 'uncategorized' ? 'General' : `Category ${categoryId.substring(0, 8)}`,
                products: []
              }
            }
            groups[categoryId].products.push(product)
          })
        }
        setCategories(Object.values(groups))
      })
      .catch(err => console.error('products API load error', err))
  }, [])

  return (
    <div className="product-page">
      <div className="container">
        <h1 className="page-title">Our Products</h1>

        {categories.map(category => (
          <div key={category.id} className="product-category-block">
            <h2 className="category-title">{category.name}</h2>

            <div className="products-grid">
              {category.products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image-wrapper">
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

                    <button className="product-button">
                      Inquire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}

export default Product
