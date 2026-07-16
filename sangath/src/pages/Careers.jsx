import { useEffect } from 'react'
import './Careers.css'

function Careers() {
  useEffect(() => {
    document.title = 'Careers - Sangath Global Exim | Join Our Team'
  }, [])

  const openings = [
    {
      id: 1,
      title: 'Export Sales Executive',
      department: 'Sales & Business Development',
      location: 'Rajkot, Gujarat',
      type: 'Full-Time',
      description:
        'Drive international sales, manage client accounts, and identify new export markets for agricultural commodities.'
    },
    {
      id: 2,
      title: 'Logistics & Documentation Coordinator',
      department: 'Operations',
      location: 'Rajkot, Gujarat',
      type: 'Full-Time',
      description:
        'Handle export documentation, shipping coordination, and customs compliance to ensure smooth international shipments.'
    },
    {
      id: 3,
      title: 'Quality Control Analyst',
      department: 'Quality Assurance',
      location: 'Rajkot, Gujarat',
      type: 'Full-Time',
      description:
        'Inspect and test agricultural commodity samples to ensure they meet APEDA, FSSAI, and international buyer standards.'
    },
    {
      id: 4,
      title: 'Business Development Manager',
      department: 'Business Development',
      location: 'Rajkot, Gujarat / Remote',
      type: 'Full-Time',
      description:
        'Identify and develop new international trade partnerships. Build relationships with buyers and importers across target markets.'
    }
  ]

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
            <h2>Why Work With Us</h2>
            <div className="section-divider"></div>
            <p>
              At Sangath Global Exim, we believe that our people are our greatest asset. We offer
              a dynamic, growth-oriented work environment where individuals can build meaningful
              careers in international agricultural trade.
            </p>
            <div className="perks-grid">
              <div className="perk-card">
                <span className="perk-icon">🌍</span>
                <h4>Global Exposure</h4>
                <p>Work with partners and clients across multiple countries and continents.</p>
              </div>
              <div className="perk-card">
                <span className="perk-icon">📈</span>
                <h4>Growth Opportunities</h4>
                <p>Fast-growing company with clear paths for professional advancement.</p>
              </div>
              <div className="perk-card">
                <span className="perk-icon">🤝</span>
                <h4>Collaborative Culture</h4>
                <p>Work in a supportive, team-oriented environment built on trust and respect.</p>
              </div>
              <div className="perk-card">
                <span className="perk-icon">🌱</span>
                <h4>Learning &amp; Development</h4>
                <p>Continuous learning opportunities in trade, logistics, and quality standards.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Openings */}
        <section className="openings-section">
          <h2>Current Openings</h2>
          <div className="section-divider"></div>
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
                    href="mailto:export.sangath@gmail.com?subject=Job Application"
                    className="btn-apply"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="careers-cta">
          <div className="careers-cta-box">
            <h2>Don&apos;t See the Right Role?</h2>
            <p>
              We&apos;re always looking for talented people. Send your CV to us and we&apos;ll
              reach out when a suitable opening arises.
            </p>
            <a
              href="mailto:export.sangath@gmail.com?subject=General Application"
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
