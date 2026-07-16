import { UserRound } from 'lucide-react'
import { useEffect } from 'react'
import './About.css'

function About() {
  useEffect(() => {
    document.title = 'About Us - Sangath Global Exim'
  }, [])

  const certifications = [
    'APEDA (Agricultural and Processed Food Products Export Development Authority)',
    'Spice Board of India',
    'FSSAI (Food Safety and Standards Authority of India)'
  ]

  const managementTeam = [
    { role: 'Partner', name: 'Prince Padmani' },
    { role: 'Partner', name: 'Dhruvil Chovatiya' },
  ]

  return (
    <div className="about-page">
      <div className="page-header">
        <div className="container">
          <h1>About Us</h1>
          <p className="page-subtitle">Your Trusted Partner in Global Agricultural Trade</p>
        </div>
      </div>

      <div className="container">
        {/* About the Company */}
        <section className="about-section">
          <h2>About Sangath Global Exim</h2>
          <div className="content-block">
            <p>
              Sangath Global Exim is a leading international export & import company specializing 
              in agricultural commodities. With a strong commitment to quality, integrity, and 
              customer satisfaction, we have established ourselves as a trusted partner in the 
              global agricultural trade industry.
            </p>
            <p>
              Our company has built a reputation for excellence through years of dedicated service, 
              maintaining the highest standards in product quality, packaging, and delivery. We 
              operate with a global network spanning multiple continents, connecting suppliers and 
              buyers across international markets.
            </p>
            <p>
              Based in Rajkot, Gujarat, India, we leverage our strategic location and extensive 
              industry knowledge to facilitate seamless trade operations. Our team of experienced 
              professionals ensures that every transaction meets international quality standards and 
              regulatory compliance.
            </p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="vision-mission-section">
          <div className="vm-grid">
            <div className="vm-card">
              <h3>Our Vision</h3>
              <ul>
                <li>To be a globally recognized leader in agricultural commodities trade</li>
                <li>To connect markets worldwide with quality products and reliable service</li>
                <li>To contribute to sustainable agricultural development globally</li>
                <li>To build long-term partnerships based on trust and mutual benefit</li>
              </ul>
            </div>
            <div className="vm-card">
              <h3>Our Mission</h3>
              <ul>
                <li>Deliver premium quality agricultural commodities to global markets</li>
                <li>Maintain the highest standards of quality assurance and compliance</li>
                <li>Provide exceptional customer service and support</li>
                <li>Foster innovation and excellence in international trade practices</li>
                <li>Ensure ethical business conduct in all operations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Management Team */}
        <section className="team-section">
          <h2>Management Team</h2>
          <div className="team-grid">
            {managementTeam.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-photo-placeholder">
                  <UserRound className="team-icon" size={42} aria-hidden="true" />
                </div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
                <p className="team-contact"><a href="tel:+919313788416">+91 93137 88416</a></p>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="certifications-section">
          <h2>Certifications & Compliance</h2>
          <p className="section-intro">
            We maintain the highest standards of quality and compliance through various 
            certifications and regulatory approvals:
          </p>
          <div className="certifications-list">
            {certifications.map((cert, index) => (
              <div key={index} className="certification-item">
                <span className="cert-icon">✓</span>
                <span>{cert}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Governance */}
        <section className="governance-section">
          <h2>Governance</h2>
          <div className="content-block">
            <p>
              Sangath Global Exim operates under strict governance principles, ensuring 
              transparency, accountability, and ethical conduct in all business operations. 
              Our governance framework includes:
            </p>
            <ul className="governance-list">
              <li>Regular compliance audits and quality checks</li>
              <li>Adherence to international trade regulations and standards</li>
              <li>Ethical sourcing and supply chain management</li>
              <li>Environmental responsibility and sustainability practices</li>
              <li>Stakeholder engagement and transparent reporting</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
