import { useEffect, useState } from 'react'
import './Product.css'

function Product() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch('/products.json')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error('products.json load error', err))
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
