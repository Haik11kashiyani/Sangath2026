import { useEffect } from 'react'
import { Check } from 'lucide-react'
import './Quality.css'

function Quality({ websiteContent }) {
  useEffect(() => {
    if (websiteContent?.general?.siteTitle) {
      document.title = `Quality & Conduct - ${websiteContent.general.logoText || 'Sangath Global Exim'}`;
    }
  }, [websiteContent])

  // Extract CMS Data with safe fallbacks
  const qualityData = websiteContent?.quality || {};
  const assurance = qualityData.assurance || { title: "Quality Assurance", paragraphs: [] };
  const qualityStandards = qualityData.qualityStandards || [];
  const packing = qualityData.packing || { title: "Packing Standards", description: "" };
  const testing = qualityData.testing || { title: "Testing & Certification", description: "" };
  const consistent = qualityData.consistent || { title: "Consistent Quality", description: "" };
  
  const conduct = qualityData.codeOfConduct || { 
    title: "Company Code of Conduct", 
    description: "Our code of conduct reflects our commitment to ethical business practices.", 
    items: [] 
  };
  
  const ethics = qualityData.ethics || { title: "Our Commitment", paragraphs: [] };
  const header = qualityData.header || {
    title: "Quality & Code of Conduct",
    subtitle: "Committed to Excellence and Ethical Business Practices",
    bannerImage: "/images/Cumin_Seeds.jpg"
  };

  return (
    <div className="quality-page">
      <div 
        className="page-header"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(5, 9, 17, 0.92), rgba(38, 50, 65, 0.84)), url('${header.bannerImage || '/images/Cumin_Seeds.jpg'}')`,
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
        {/* Quality Assurance Section */}
        <section className="quality-assurance-section">
          <div className="section-header-custom">
            <h2>{assurance.title || "Quality Assurance"}</h2>
            <div className="section-divider"></div>
          </div>

          <div className="quality-content">
            <div className="quality-intro">
              {assurance.paragraphs && assurance.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            <div className="quality-standards-grid">
              {qualityStandards.map((standard, index) => (
                <div key={index} className="standard-card">
                  <Check className="standard-icon" size={18} aria-hidden="true" />
                  <span className="standard-text">{standard}</span>
                </div>
              ))}
            </div>

            <div className="quality-details">
              {packing.description && (
                <div className="detail-block">
                  <h3>{packing.title || "Packing Standards"}</h3>
                  <p>{packing.description}</p>
                </div>
              )}
              {testing.description && (
                <div className="detail-block">
                  <h3>{testing.title || "Testing & Certification"}</h3>
                  <p>{testing.description}</p>
                </div>
              )}
              {consistent.description && (
                <div className="detail-block">
                  <h3>{consistent.title || "Consistent Quality"}</h3>
                  <p>{consistent.description}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Code of Conduct Section */}
        <section className="code-of-conduct-section">
          <div className="section-header-custom">
            <h2>{conduct.title || "Company Code of Conduct"}</h2>
            <div className="section-divider"></div>
            {conduct.description && <p className="section-description">{conduct.description}</p>}
          </div>

          <div className="conduct-grid">
            {conduct.items && conduct.items.map((item, index) => (
              <div key={index} className="conduct-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ethics Statement */}
        <section className="ethics-statement">
          <div 
            className="ethics-box"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(5, 9, 17, 0.94), rgba(38, 50, 65, 0.88)), url('${ethics.bannerImage || '/images/Fenugreek_Powder.webp'}')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          >
            <h2>{ethics.title || "Our Commitment"}</h2>
            {ethics.paragraphs && ethics.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Quality
