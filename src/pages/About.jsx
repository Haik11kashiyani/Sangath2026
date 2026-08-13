import { UserRound } from 'lucide-react'
import { useEffect } from 'react'
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
  const managementTeam = aboutData.managementTeam || [];
  
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
                {member.phone && (
                  <p className="team-contact">
                    <a href={`tel:${member.phone.replace(/\s+/g, '')}`}>{member.phone}</a>
                  </p>
                )}
              </div>
            ))}
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
