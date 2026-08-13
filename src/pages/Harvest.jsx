import { useEffect } from 'react'
import './Harvest.css'

function Harvest({ websiteContent }) {
  useEffect(() => {
    if (websiteContent?.general?.siteTitle) {
      document.title = `Harvest Chart - ${websiteContent.general.logoText || 'Sangath Global Exim'}`;
    }
  }, [websiteContent])

  const harvestData = websiteContent?.harvest || {};
  const months = harvestData.months || [];

  return (
    <div className="harvest-page">
      <div className="container">
        <h1 className="page-title">{harvestData.title || "Harvest Chart"}</h1>
        <p className="page-subtitle">{harvestData.subtitle || "Monthly harvest schedule for our products"}</p>
        <div className="harvest-grid">
          {months.map((item, index) => (
            <div key={index} className="harvest-card">
              <div className="harvest-month">{item.month}</div>
              <div className="harvest-products">
                {item.products && item.products.map((product, idx) => (
                  <span key={idx} className="product-tag">{product}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Harvest
