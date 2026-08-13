import { useEffect } from 'react'
import './Careers.css'

function Careers({ websiteContent }) {
  useEffect(() => {
    if (websiteContent?.general?.siteTitle) {
      document.title = `Careers - ${websiteContent.general.logoText || 'Sangath Global Exim'}`;
    }
  }, [websiteContent])

  // Extract CMS Data with safe fallbacks
  const careersData = websiteContent?.careers || {};
  const intro = careersData.intro || { title: "Why Work With Us", description: "" };
  const perks = careersData.perks || [];
  const openings = careersData.openings || [];
  const cta = careersData.cta || { title: "Don't See the Right Role?", description: "" };
  
  const recEmail = websiteContent?.general?.email || "export.sangath@gmail.com";

  return (
    <div className="careers-page">
      <div className="page-header">
        <div className="container">
          <h1>Careers</h1>
          <p className="page-subtitle">Join Our Growing Global Team</p>
        </div>
      </div>

      <div className="container">
        {/* Intro */}
        <section className="careers-intro-section">
          <div className="careers-intro-content">
            <h2>{intro.title}</h2>
            <div className="section-divider"></div>
            {intro.description && <p>{intro.description}</p>}
            
            <div className="perks-grid">
              {perks.map((perk, index) => (
                <div key={index} className="perk-card">
                  <span className="perk-icon">{perk.icon || '🌍'}</span>
                  <h4>{perk.title}</h4>
                  <p>{perk.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Openings */}
        <section className="openings-section">
          <h2>Current Openings</h2>
          <div className="section-divider"></div>
          {openings.length === 0 ? (
            <div className="no-openings-card">
              <p>No job openings at this time. Send us your CV for general application!</p>
            </div>
          ) : (
            <div className="openings-list">
              {openings.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-info">
                    <h3 className="job-title">{job.title}</h3>
                    <div className="job-meta">
                      <span className="job-dept">{job.department}</span>
                      <span className="job-sep">·</span>
                      <span className="job-location">📍 {job.location}</span>
                      <span className="job-sep">·</span>
                      <span className="job-type">{job.type}</span>
                    </div>
                    <p className="job-description">{job.description}</p>
                  </div>
                  <div className="job-action">
                    <a
                      href={`mailto:${recEmail}?subject=Application for ${encodeURIComponent(job.title)}`}
                      className="btn-apply"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="careers-cta">
          <div 
            className="careers-cta-box"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(5, 9, 17, 0.94), rgba(38, 50, 65, 0.88)), url('${cta.bannerImage || '/images/Cumin_Seeds.jpg'}')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          >
            <h2>{cta.title}</h2>
            <p>{cta.description}</p>
            <a
              href={`mailto:${recEmail}?subject=General Application`}
              className="btn-send-cv"
            >
              Send Your CV
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Careers
