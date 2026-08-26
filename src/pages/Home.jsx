import { useEffect } from 'react'
import { ShieldCheck, Globe, Boxes, Star, BadgeCheck } from 'lucide-react'
import { getCountryFlagUrl } from '../utils/flags'
import './Home.css'

function Home({ setCurrentPage, websiteContent }) {
  useEffect(() => {
    if (websiteContent?.general?.siteTitle) {
      document.title = websiteContent.general.siteTitle;
    }
  }, [websiteContent])

  // Extract CMS Data with safe fallbacks
  const homeData = websiteContent?.home || {};
  const hero = homeData.hero || {
    title: "Sangath Global Exim",
    subtitle: "Welcome to",
    tagline: "Global Trading & Marketing of Agricultural Commodities",
    description: "Your trusted partner for global agricultural commodity exports and imports."
  };
  
  const aboutSnapshot = homeData.aboutSnapshot || {
    title: "About Sangath Global Exim",
    paragraphs: []
  };

  const benefits = homeData.benefits || [];
  const exportRegions = homeData.exportRegions || [];

  // Match Lucide vector icons for benefits
  const getBenefitIcon = (index) => {
    switch (index) {
      case 0: return <ShieldCheck size={36} className="benefit-vector-icon" />;
      case 1: return <Globe size={36} className="benefit-vector-icon" />;
      case 2: return <Boxes size={36} className="benefit-vector-icon" />;
      case 3: return <BadgeCheck size={36} className="benefit-vector-icon" />;
      default: return <ShieldCheck size={36} className="benefit-vector-icon" />;
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section 
        id="hero" 
        className={`hero-section ${hero.bannerVideo ? 'has-bg-video' : ''}`}
        style={{ 
          backgroundImage: (!hero.bannerVideo && hero.bannerImage)
            ? `linear-gradient(90deg, rgba(5, 9, 17, 0.92) 0%, rgba(11, 19, 32, 0.78) 42%, rgba(11, 19, 32, 0.38) 100%), url(${hero.bannerImage})` 
            : undefined 
        }}
      >
        {/* Background Video Support */}
        {hero.bannerVideo && (
          <video
            src={hero.bannerVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="section-bg-video"
            poster={hero.bannerImage || undefined}
          />
        )}
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>
            <span className="hero-title-prefix">{hero.subtitle}</span>
            <span className="hero-title-brand">{hero.title}</span>
          </h1>
          <p className="hero-subtitle">{hero.tagline}</p>
          <p className="hero-description">{hero.description}</p>
          
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
            <h2>{aboutSnapshot.title}</h2>
            <div className="section-divider"></div>
          </div>
          <div className="about-content">
            {aboutSnapshot.paragraphs && aboutSnapshot.paragraphs.map((p, index) => (
              <p key={index}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Exports Highlights */}
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
                {exportRegions
                  .filter(c => {
                    const name = typeof c === 'object' ? c.name : c;
                    return name && name.toLowerCase() !== 'benin';
                  })
                  .map((country, index) => {
                    const name = typeof country === 'object' ? country.name : country;
                    const flagUrl = (typeof country === 'object' && country.flag) ? country.flag : getCountryFlagUrl(name);
                    return (
                      <span key={index} className="country-tag">
                        {flagUrl && (
                          <img 
                            src={flagUrl} 
                            alt={`${name} flag`} 
                            className="country-flag-round" 
                          />
                        )}
                        <span>{name}</span>
                      </span>
                    );
                  })}
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
                <div className="benefit-icon">
                  {benefit.icon ? (
                    <img src={benefit.icon} alt={benefit.title} className="benefit-custom-icon" />
                  ) : (
                    getBenefitIcon(index)
                  )}
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section 
        className={`footer-cta ${homeData.cta?.bannerVideo ? 'has-bg-video' : ''}`}
        style={{
          backgroundImage: (!homeData.cta?.bannerVideo && (homeData.cta?.bannerImage || '/images/red_chilli.jpeg'))
            ? `linear-gradient(135deg, rgba(5, 9, 17, 0.92), rgba(38, 50, 65, 0.88)), url('${homeData.cta?.bannerImage || '/images/red_chilli.jpeg'}')`
            : undefined,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        {/* Video Background for CTA */}
        {homeData.cta?.bannerVideo && (
          <video
            src={homeData.cta.bannerVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="section-bg-video"
            poster={homeData.cta?.bannerImage || undefined}
          />
        )}
        {/* Seamless Blend Overlay Melting into Footer */}
        <div className="footer-cta-blend-overlay"></div>
        <div className="container">
          <div className="cta-content">
            <h2>{homeData.cta?.title || "Ready to Partner With Us?"}</h2>
            <p>{homeData.cta?.description || "Contact us today to discuss your requirements and get a competitive quote"}</p>
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
