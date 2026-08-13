import { Check, Globe2 } from 'lucide-react'
import { useEffect } from 'react'
import { getCountryFlagUrl } from '../utils/flags'
import './ExportsImports.css'

function ExportsImports({ setCurrentPage, websiteContent }) {
  useEffect(() => {
    if (websiteContent?.general?.siteTitle) {
      document.title = `Exports & Imports - ${websiteContent.general.logoText || 'Sangath Global Exim'}`;
    }
  }, [websiteContent])

  // Extract CMS Data with safe fallbacks
  const tradeData = websiteContent?.exportsImports || {};
  const exportData = tradeData.exports || { title: "Our Exports", description: "", countries: [], products: [] };
  const partnership = tradeData.partnership || { title: "Become a Global Partner", description: "" };

  const exportCountries = (exportData.countries || []).filter(c => c.toLowerCase() !== 'benin');

  const header = websiteContent?.exportsImports?.header || {
    title: "Exports & Imports",
    subtitle: "Connecting Global Markets with Quality Products",
    bannerImage: "/images/exports_imports_banner.jpg"
  };

  return (
    <div className="exports-imports-page">
      <div 
        className="page-header"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(5, 9, 17, 0.88), rgba(38, 50, 65, 0.74)), url('${header.bannerImage || '/images/exports_imports_banner.jpg'}')`,
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
        {/* Exports Section */}
        <section className="exports-section">
          <div className="section-header-custom">
            <h2>{exportData.title || "Our Exports"}</h2>
            <div className="section-divider"></div>
            {exportData.description && <p className="section-description">{exportData.description}</p>}
          </div>

          <div className="trade-grid">
            <div className="trade-card">
              <h3>Export Destinations</h3>
              <div className="countries-grid">
                {exportCountries.map((country, index) => {
                  const name = typeof country === 'object' ? country.name : country;
                  const flagUrl = (typeof country === 'object' && country.flag) ? country.flag : getCountryFlagUrl(name);
                  return (
                    <div key={index} className="country-card export">
                      {flagUrl ? (
                        <img 
                          src={flagUrl} 
                          alt={`${name} flag`} 
                          className="country-flag-round" 
                        />
                      ) : (
                        <Globe2 className="country-icon" size={26} aria-hidden="true" />
                      )}
                      <span className="country-name">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="trade-card">
              <h3>Export Products</h3>
              <ul className="products-list">
                {exportData.products && exportData.products.map((product, index) => (
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
          <div 
            className="cta-content-box"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(5, 9, 17, 0.94), rgba(38, 50, 65, 0.88)), url('${partnership.bannerImage || '/images/Coriander_powder.webp'}')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          >
            <h2>{partnership.title}</h2>
            <p>{partnership.description}</p>
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
