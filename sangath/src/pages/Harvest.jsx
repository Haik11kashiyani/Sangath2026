import './Harvest.css'

function Harvest() {
  const harvestData = [
    { month: 'January', products: ['Wheat', 'Barley'] },
    { month: 'February', products: ['Onions', 'Garlic'] },
    { month: 'March', products: ['Rice', 'Corn'] },
    { month: 'April', products: ['Pulses', 'Lentils'] },
    { month: 'May', products: ['Sesame', 'Sunflower'] },
    { month: 'June', products: ['Cotton', 'Jute'] },
    { month: 'July', products: ['Millet', 'Sorghum'] },
    { month: 'August', products: ['Soybean', 'Groundnut'] },
    { month: 'September', products: ['Rice', 'Maize'] },
    { month: 'October', products: ['Wheat', 'Mustard'] },
    { month: 'November', products: ['Onions', 'Potatoes'] },
    { month: 'December', products: ['Peas', 'Beans'] },
  ]

  return (
    <div className="harvest-page">
      <div className="container">
        <h1 className="page-title">Harvest Chart</h1>
        <p className="page-subtitle">Monthly harvest schedule for our products</p>
        <div className="harvest-grid">
          {harvestData.map((item, index) => (
            <div key={index} className="harvest-card">
              <div className="harvest-month">{item.month}</div>
              <div className="harvest-products">
                {item.products.map((product, idx) => (
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

