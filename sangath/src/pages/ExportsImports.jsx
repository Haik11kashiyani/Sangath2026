import { Check, Globe2, MapPin } from 'lucide-react'
import { useEffect } from 'react'
import './ExportsImports.css'

function ExportsImports({ setCurrentPage }) {
  useEffect(() => {
    document.title = 'Exports & Imports - Sangath Global Exim | Global Trade Network'
  }, [])

  const exportData = {
    countries: [
      'Sri Lanka', 'Malaysia', 'Bangladesh', 'UAE', 'Singapore', 
      'Russia', 'Djibouti', 'Benin', 'Afghanistan'
    ],
    products: [
      'Sugar (Refined & Raw)',
      'Spices (Turmeric, Coriander, Cumin, Black Pepper)',
      'Food Grains (Rice, Wheat, Maize)',
      'Tea (CTC & Orthodox)',
      'Pulses (Lentils, Chickpeas, Kidney Beans)',
      'Agro Feed & Feed Ingredients'
    ]
  }

  const importData = {
    countries: [
      'Canada', 'Australia', 'Myanmar', 'Tanzania'
    ],
    products: [
      'Premium Wheat',
      'High-Quality Pulses',
      'Specialty Grains',
      'Feed Ingredients',
      'Organic Commodities'
    ]
  }

  return (
    <div className="exports-imports-page">
      <div className="page-header">
        <div className="container">
          <h1>Exports & Imports</h1>
          <p className="page-subtitle">Connecting Global Markets with Quality Products</p>
        </div>
      </div>

      <div className="container">
        {/* Exports Section */}
        <section className="exports-section">
          <div className="section-header-custom">
            <h2>Our Exports</h2>
            <div className="section-divider"></div>
            <p className="section-description">
              We export premium agricultural commodities to markets across the globe, 
              ensuring quality products reach our international partners.
            </p>
          </div>

          <div className="trade-grid">
            <div className="trade-card">
              <h3>Export Destinations</h3>
              <div className="countries-grid">
                {exportData.countries.map((country, index) => (
                  <div key={index} className="country-card export">
                    <Globe2 className="country-icon" size={26} aria-hidden="true" />
                    <span className="country-name">{country}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="trade-card">
              <h3>Export Products</h3>
              <ul className="products-list">
                {exportData.products.map((product, index) => (
                  <li key={index}>
                    <Check className="product-icon" size={18} aria-hidden="true" />
                    <span>{product}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Imports Section */}
        <section className="imports-section">
          <div className="section-header-custom">
            <h2>Our Imports</h2>
            <div className="section-divider"></div>
            <p className="section-description">
              We source quality agricultural commodities from trusted international suppliers 
              to meet domestic market demands and ensure product diversity.
            </p>
          </div>

          <div className="trade-grid">
            <div className="trade-card">
              <h3>Import Origins</h3>
              <div className="countries-grid">
                {importData.countries.map((country, index) => (
                  <div key={index} className="country-card import">
                    <MapPin className="country-icon" size={26} aria-hidden="true" />
                    <span className="country-name">{country}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="trade-card">
              <h3>Import Products</h3>
              <ul className="products-list">
                {importData.products.map((product, index) => (
                  <li key={index}>
                    <Check className="product-icon" size={18} aria-hidden="true" />
                    <span>{product}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="partnership-cta">
          <div className="cta-content-box">
            <h2>Become a Global Partner</h2>
            <p>
              Join our network of international partners and benefit from our extensive 
              trade experience, quality assurance, and reliable supply chain management.
            </p>
            <button 
              className="btn-partner"
              onClick={() => setCurrentPage('contact')}
            >
              Contact Us
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ExportsImports
