import { useState, useEffect } from 'react'
import './Navbar.css'

const defaultMenuItems = [
  { id: 'home', label: 'HOME', page: 'home', order: 1 },
  { id: 'about', label: 'ABOUT US', page: 'about', order: 2 },
  { id: 'product', label: 'OUR PRODUCTS', page: 'product', order: 3, hasDropdown: true },
  { id: 'contact', label: 'CONTACT US', page: 'contact', order: 4 }
]

const getSavedMenuItems = () => {
  const savedMenu = localStorage.getItem('sangath_menu')
  return savedMenu ? JSON.parse(savedMenu) : defaultMenuItems
}

function Navbar({ currentPage, setCurrentPage }) {
  const [menuItems, setMenuItems] = useState(getSavedMenuItems)

  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Product categories dropdown items
  const productCategories = [
    { id: 'sugar', label: 'Sugar', category: 'sugar' },
    { id: 'spices', label: 'Spices', category: 'spices' },
    { id: 'food-grains', label: 'Food Grains', category: 'grains' },
    { id: 'tea', label: 'Tea', category: 'tea' },
    { id: 'pulses', label: 'Pulses', category: 'pulses' },
    { id: 'agro-feed', label: 'Agro Feed', category: 'other' }
  ]

  // Listen for storage changes to update menu
  useEffect(() => {
    const handleStorageChange = () => {
      const savedMenu = localStorage.getItem('sangath_menu')
      if (savedMenu) {
        setMenuItems(JSON.parse(savedMenu))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const sortedMenuItems = [...menuItems].sort((a, b) => a.order - b.order)

  return (
    <nav className="navbar">
      {/* Top Header Section */}
      <div className="navbar-header">
        <div className="navbar-header-container">
          <div className="navbar-logo" onClick={() => setCurrentPage('home')}>
            <div className="logo-text-wrapper">
              <span className="logo-text-main">SANGATH GLOBAL EXIM.</span>
            </div>
            
          </div>
         
          <div className="navbar-contact">
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div className="contact-details">
                <span className="contact-value">+91-8780044296</span>
                <span className="contact-label">Make A Call</span>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <div className="contact-details">
                <span className="contact-value">export.sangath@gmail.com</span>
                <span className="contact-label">Get An Estimate</span>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🌍</span>
              <div className="contact-details">
                <span className="contact-value">Rajkot - 360 004, India</span>
                <span className="contact-label">Location</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu Bar */}
      <div className="navbar-menu-bar">
        <div className="navbar-menu-container">
          <ul className="navbar-menu">
            {sortedMenuItems.map((item) => (
              <li 
                key={item.id}
                className={item.hasDropdown ? 'has-dropdown' : ''}
                onMouseEnter={() => item.hasDropdown && setDropdownOpen(true)}
                onMouseLeave={() => item.hasDropdown && setDropdownOpen(false)}
              >
                <button
                  className={currentPage === item.page ? 'active' : ''}
                  onClick={() => {
                    if (!item.hasDropdown) {
                      setCurrentPage(item.page)
                    } else {
                      setCurrentPage('product')
                    }
                  }}
                >
                  {item.label}
                  {item.hasDropdown && <span className="dropdown-arrow">▼</span>}
                </button>
                {item.hasDropdown && dropdownOpen && (
                  <ul className="dropdown-menu">
                    {productCategories.map((category) => (
                      <li key={category.id}>
                        <button
                          onClick={() => {
                            setCurrentPage('product')
                            // You can add category filtering logic here
                            // For example, store selected category in localStorage or state
                            localStorage.setItem('selectedCategory', category.category)
                            setDropdownOpen(false)
                          }}
                        >
                          {category.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <button className="navbar-toggle" onClick={() => {
            document.querySelector('.navbar-menu').classList.toggle('active')
          }}>
            ☰
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
