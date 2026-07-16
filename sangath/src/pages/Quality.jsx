import { useEffect } from 'react'
import { Check } from 'lucide-react'
import './Quality.css'

function Quality() {
  useEffect(() => {
    document.title = 'Quality & Code of Conduct - Sangath Global Exim'
  }, [])

  const qualityStandards = [
    'Rigorous quality testing at every stage',
    'Compliance with international food safety standards',
    'Proper storage and handling facilities',
    'Consistent product quality across all shipments',
    'Traceability and documentation',
    'Regular quality audits and inspections'
  ]

  const codeOfConduct = [
    {
      title: 'Honesty & Integrity',
      description: 'We conduct all business operations with complete transparency and ethical practices.'
    },
    {
      title: 'Innovation & Excellence',
      description: 'We continuously improve our processes and services to deliver the best value to our customers.'
    },
    {
      title: 'Respect for Customers',
      description: 'We prioritize customer satisfaction and build long-term relationships based on trust and mutual respect.'
    },
    {
      title: 'High Ethical Standards',
      description: 'We maintain the highest ethical standards in all our business dealings and relationships.'
    },
    {
      title: 'Environmental Responsibility',
      description: 'We are committed to sustainable practices and environmental conservation in our operations.'
    },
    {
      title: 'Fair Trade Practices',
      description: 'We ensure fair treatment of all stakeholders including suppliers, employees, and partners.'
    }
  ]

  return (
    <div className="quality-page">
      <div className="page-header">
        <div className="container">
          <h1>Quality & Code of Conduct</h1>
          <p className="page-subtitle">Committed to Excellence and Ethical Business Practices</p>
        </div>
      </div>

      <div className="container">
        {/* Quality Assurance Section */}
        <section className="quality-assurance-section">
          <div className="section-header-custom">
            <h2>Quality Assurance</h2>
            <div className="section-divider"></div>
          </div>

          <div className="quality-content">
            <div className="quality-intro">
              <p>
                At Sangath Global Exim, quality is at the heart of everything we do. We understand 
                that consistent quality is essential for building trust and maintaining long-term 
                relationships with our customers worldwide.
              </p>
              <p>
                Our quality assurance process begins from the sourcing stage and continues through 
                processing, packaging, storage, and delivery. We maintain strict quality control 
                measures to ensure that every product meets international standards and customer 
                expectations.
              </p>
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
              <div className="detail-block">
                <h3>Packing Standards</h3>
                <p>
                  We use high-quality packaging materials that protect products during transit and 
                  storage. Our packaging meets international standards and ensures product integrity 
                  throughout the supply chain.
                </p>
              </div>
              <div className="detail-block">
                <h3>Testing & Certification</h3>
                <p>
                  All products undergo rigorous testing for quality, purity, and safety. We maintain 
                  certifications from recognized authorities including APEDA, Spice Board, and FSSAI.
                </p>
              </div>
              <div className="detail-block">
                <h3>Consistent Quality</h3>
                <p>
                  We have established quality benchmarks for each product category and ensure 
                  consistent quality across all shipments. Our quality control team monitors every 
                  batch to maintain these standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Code of Conduct Section */}
        <section className="code-of-conduct-section">
          <div className="section-header-custom">
            <h2>Company Code of Conduct</h2>
            <div className="section-divider"></div>
            <p className="section-description">
              Our code of conduct reflects our commitment to ethical business practices and 
              responsible corporate behavior.
            </p>
          </div>

          <div className="conduct-grid">
            {codeOfConduct.map((item, index) => (
              <div key={index} className="conduct-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ethics Statement */}
        <section className="ethics-statement">
          <div className="ethics-box">
            <h2>Our Commitment</h2>
            <p>
              Sangath Global Exim is committed to maintaining the highest standards of business 
              ethics and integrity. We believe that ethical conduct is fundamental to sustainable 
              business success and building trust with all stakeholders.
            </p>
            <p>
              We ensure that all our business operations comply with applicable laws and 
              regulations, and we continuously work towards improving our ethical standards and 
              corporate governance practices.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Quality
