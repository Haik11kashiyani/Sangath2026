import { useEffect } from 'react'
import './Blog.css'

function Blog({ websiteContent }) {
  useEffect(() => {
    if (websiteContent?.general?.siteTitle) {
      document.title = `Blog & News - ${websiteContent.general.logoText || 'Sangath Global Exim'}`;
    }
  }, [websiteContent])

  // Load posts dynamically from CMS database
  const blogData = websiteContent?.blog || {};
  const posts = blogData.posts || [];

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
          {posts.length === 0 ? (
            <div className="no-posts-card">
              <p>No blog posts published yet. Stay tuned!</p>
            </div>
          ) : (
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
                    <span className="blog-read-time">{post.readTime || '3 min read'}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Blog
