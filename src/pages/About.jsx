import { Check, Globe2 } from 'lucide-react'
import { useEffect } from 'react'
import { getCountryFlagUrl } from '../utils/flags'
import './About.css'

function About({ websiteContent }) {
  useEffect(() => {
    if (websiteContent?.general?.siteTitle) {
      document.title = `About Us - ${websiteContent.general.logoText || 'Sangath Global Exim'}`;
    }
  }, [websiteContent])

  // Extract CMS Data with safe fallbacks
  const aboutData = websiteContent?.about || {};
  const company = aboutData.company || { title: "About Sangath Global Exim", paragraphs: [] };
  const vision = aboutData.vision || { title: "Our Vision", items: [] };
  const mission = aboutData.mission || { title: "Our Mission", items: [] };
  
  const certifications = aboutData.certifications || { 
    title: "Certifications & Compliance", 
    intro: "We maintain the highest standards of quality and compliance:", 
    items: [] 
  };
  
  const governance = aboutData.governance || { 
    title: "Governance", 
    intro: "We operate under strict governance principles:", 
    items: [] 
  };

  // Exports data from CMS
  const tradeData = websiteContent?.exportsImports || {};
  const exportData = tradeData.exports || { title: "Our Exports", description: "", countries: [], products: [] };
  const exportCountries = (exportData.countries || []).filter(c => {
    const name = typeof c === 'object' ? c.name : c;
    return name.toLowerCase() !== 'benin';
  });

  const bannerImage = aboutData.bannerImage || '/images/about_us_banner.png';
  const header = aboutData.header || {
    title: "About Us",
    subtitle: "Your Trusted Partner in Global Agricultural Trade",
    bannerImage: bannerImage
  };
  const bannerUrl = header.bannerImage || bannerImage;

  return (
    <div className="about-page">
      <div 
        className="page-header"
        style={{ 
          backgroundImage: `linear-gradient(135deg, rgba(5, 9, 17, 0.82), rgba(38, 50, 65, 0.72)), url('${bannerUrl}')`,
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
        {/* About the Company */}
        <section className="about-section">
          <h2>{company.title}</h2>
          <div className="content-block">
            {company.paragraphs && company.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="vision-mission-section">
          <div className="vm-grid">
            <div className="vm-card">
              <h3>{vision.title}</h3>
              <ul>
                {vision.items && vision.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="vm-card">
              <h3>{mission.title}</h3>
              <ul>
                {mission.items && mission.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Our Exports Section (replaces Management Team) */}
        <section className="about-exports-section">
          <div className="about-exports-header">
            <h2>{exportData.title || "Our Exports"}</h2>
            <div className="about-exports-divider"></div>
            {exportData.description && <p className="about-exports-description">{exportData.description}</p>}
          </div>

          <div className="about-exports-grid">
            <div className="about-exports-card">
              <h3>Export Destinations</h3>
              <div className="about-exports-countries">
                {exportCountries.map((country, index) => {
                  const name = typeof country === 'object' ? country.name : country;
                  const flagUrl = (typeof country === 'object' && country.flag) ? country.flag : getCountryFlagUrl(name);
                  return (
                    <div key={index} className="about-exports-country">
                      {flagUrl ? (
                        <img 
                          src={flagUrl} 
                          alt={`${name} flag`} 
                          className="about-exports-flag" 
                        />
                      ) : (
                        <Globe2 className="about-exports-globe-icon" size={26} aria-hidden="true" />
                      )}
                      <span className="about-exports-country-name">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="about-exports-card">
              <h3>Export Products</h3>
              <ul className="about-exports-products-list">
                {exportData.products && exportData.products.map((product, index) => (
                  <li key={index}>
                    <Check className="about-exports-check-icon" size={18} aria-hidden="true" />
                    <span>{product}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="certifications-section">
          <h2>{certifications.title}</h2>
          <p className="section-intro">{certifications.intro}</p>
          <div className="certifications-list">
            {certifications.items && certifications.items.map((cert, index) => (
              <div key={index} className="certification-item">
                <span className="cert-icon">✓</span>
                <span>{cert}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Governance */}
        <section className="governance-section">
          <h2>{governance.title}</h2>
          <div className="content-block">
            <p>{governance.intro}</p>
            <ul className="governance-list">
              {governance.items && governance.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
