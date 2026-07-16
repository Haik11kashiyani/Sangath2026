import { useEffect } from 'react'
import bulkIcon from '../assets/icons/bs.JPG'
import globalIcon from '../assets/icons/gn.JPG'
import qualityIcon from '../assets/icons/qa.JPG'
import trustedIcon from '../assets/icons/ts.JPG'
import './Home.css'

function Home({ setCurrentPage }) {
  useEffect(() => {
    document.title = 'Sangath Global Exim - Global Agricultural Commodities Export & Import'
  }, [])

  const exportRegions = [
    'Sri Lanka', 'Malaysia', 'Bangladesh', 'UAE', 'Singapore',
    'Russia', 'Djibouti', 'Benin', 'Afghanistan'
  ]

  const importOrigins = [
    'Canada', 'Australia', 'Myanmar', 'Tanzania'
  ]

  const benefits = [
    {
      title: 'Quality Assurance',
      description: 'Rigorous quality control and testing standards ensure consistent product excellence.',
      icon: qualityIcon
    },
    {
      title: 'Global Network',
      description: 'Extensive international network spanning multiple continents and markets.',
      icon: globalIcon
    },
    {
      title: 'Bulk Supply',
      description: 'Capable of handling large-scale orders with reliable supply chain management.',
      icon: bulkIcon
    },
    {
      title: 'Trusted Supplier',
      description: 'Years of experience and proven track record in international trade.',
      icon: trustedIcon
    }
  ]

  return (
    <div className="home-page">
      {/* Hero Section */}

      <section id="hero" className="hero-section">
          <marquee className="construction-text" behavior="scroll" direction="left">
            Website is under construction
          </marquee>
        <div className="hero-overlay"></div>
        <div className="hero-content">

          <h1>
            <span className="hero-title-prefix">Welcome to</span>
            <span className="hero-title-brand">Sangath Global Exim</span>
          </h1>
          <p className="hero-subtitle">Global Trading & Marketing of Agricultural Commodities</p>
          <p className="hero-tagline">Your trusted partner for global agricultural commodity exports and imports.</p>
          <p className="hero-description">
            We are your trusted global partner in agricultural commodities export & import.
          </p>
          <div className="hero-cta">
            <button
              className="btn btn-primary"
              onClick={() => setCurrentPage('products')}
            >
              Our Products
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage('contact')}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* About Snapshot */}
      <section className="about-snapshot">
        <div className="container">
          <div className="section-header">
            <h2>About Sangath Global Exim</h2>
            <div className="section-divider"></div>
          </div>
          <div className="about-content">
            <p>
              Sangath Global Exim is a leading international export &amp; import company specializing
              in agricultural commodities. With a strong global presence and years of industry
              expertise, we connect markets worldwide, ensuring quality products reach customers
              across continents.
            </p>
            <p>
              Our commitment to excellence, ethical business practices, and customer satisfaction
              has established us as a trusted partner in the global agricultural trade industry.
            </p>
          </div>
        </div>
      </section>

     

      {/* Exports & Imports Highlights */}
      <section className="exports-imports-highlights">
        <div className="container">
          <div className="section-header">
            <h2>Global Reach</h2>
            <div className="section-divider"></div>
          </div>

          <div className="highlights-grid">
            <div className="highlight-card exports">
              <h3>Our Exports</h3>
              <p className="highlight-description">
                We export premium agricultural commodities to markets across the globe
              </p>
              <div className="countries-list">
                {exportRegions.map((country, index) => (
                  <span key={index} className="country-tag">{country}</span>
                ))}
              </div>
            </div>

            <div className="highlight-card imports">
              <h3>Our Imports</h3>
              <p className="highlight-description">
                Sourcing quality products from trusted international suppliers
              </p>
              <div className="countries-list">
                {importOrigins.map((country, index) => (
                  <span key={index} className="country-tag">{country}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-us">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Us</h2>
            <div className="section-divider"></div>
          </div>

          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon"><img src={benefit.icon} alt={benefit.title} /></div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Partner With Us?</h2>
            <p>Contact us today to discuss your requirements and get a competitive quote</p>
            <button
              className="btn btn-primary btn-large"
              onClick={() => setCurrentPage('contact')}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
