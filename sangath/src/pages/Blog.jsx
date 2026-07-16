import { useEffect } from 'react'
import './Blog.css'

function Blog() {
  useEffect(() => {
    document.title = 'Blog - Sangath Global Exim | Insights & News'
  }, [])

  const posts = [
    {
      id: 1,
      category: 'Industry Insights',
      title: 'Global Demand for Indian Spices: Trends & Opportunities',
      excerpt:
        'India remains the world's largest producer and exporter of spices. Discover how global demand is shaping new trade opportunities for exporters.',
      date: 'June 10, 2026',
      readTime: '4 min read'
    },
    {
      id: 2,
      category: 'Trade News',
      title: 'Understanding APEDA Regulations for Agricultural Exports',
      excerpt:
        'A comprehensive overview of APEDA guidelines that every agricultural exporter must know before shipping commodities internationally.',
      date: 'May 28, 2026',
      readTime: '5 min read'
    },
    {
      id: 3,
      category: 'Product Spotlight',
      title: 'Turmeric: The Golden Spice Driving Global Export Growth',
      excerpt:
        'Turmeric exports from India have surged over the last decade. Learn about quality standards, key markets, and what buyers look for.',
      date: 'May 15, 2026',
      readTime: '3 min read'
    },
    {
      id: 4,
      category: 'Sustainability',
      title: 'Sustainable Sourcing in Agricultural Commodity Trade',
      excerpt:
        'Responsible sourcing is no longer optional — it is a business imperative. Here is how Sangath Global Exim approaches sustainability in its supply chain.',
      date: 'April 30, 2026',
      readTime: '4 min read'
    },
    {
      id: 5,
      category: 'Market Update',
      title: 'Key Export Destinations for Indian Food Grains in 2026',
      excerpt:
        'From Southeast Asia to the Middle East, Indian food grains continue to find new buyers. An analysis of key markets and demand drivers.',
      date: 'April 12, 2026',
      readTime: '5 min read'
    },
    {
      id: 6,
      category: 'Company News',
      title: 'Sangath Global Exim Expands Its Export Network',
      excerpt:
        'We are excited to announce the addition of new trade partnerships across the Gulf and Southeast Asian regions, strengthening our global reach.',
      date: 'March 22, 2026',
      readTime: '2 min read'
    }
  ]

  const categoryColors = {
    'Industry Insights': '#1565c0',
    'Trade News': '#2e7d32',
    'Product Spotlight': '#c0392b',
    'Sustainability': '#16a085',
    'Market Update': '#8e44ad',
    'Company News': '#c7a45b'
  }

  return (
    <div className="blog-page">
      <div className="page-header">
        <div className="container">
          <h1>Blog</h1>
          <p className="page-subtitle">Insights, Updates &amp; Industry News</p>
        </div>
      </div>

      <div className="container">
        <section className="blog-section">
          <div className="blog-grid">
            {posts.map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-card-top">
                  <span
                    className="blog-category"
                    style={{ background: categoryColors[post.category] || '#333' }}
                  >
                    {post.category}
                  </span>
                </div>
                <div className="blog-card-body">
                  <h3 className="blog-title">{post.title}</h3>
                  <p className="blog-excerpt">{post.excerpt}</p>
                </div>
                <div className="blog-card-footer">
                  <span className="blog-date">{post.date}</span>
                  <span className="blog-read-time">{post.readTime}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Blog
