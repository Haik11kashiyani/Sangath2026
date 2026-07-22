import { useEffect, useState } from 'react'
import { API_URL } from '../config/runtime.js'
import { supabase, hasSupabase } from '../config/supabaseClient.js'
import './Product.css'

function Product() {
  const [categories, setCategories] = useState([])

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
        console.error('products API or Supabase load error', err)
      }
    }

    loadProducts()
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
