import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from "../assets/logo.png";
import './Header.css';


function Header({ currentPage, setCurrentPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const menuItems = [
    { id: 'home', label: 'Home', page: 'home' },
    { id: 'about', label: 'About Us', page: 'about' },
    { id: 'products', label: 'Products', page: 'products' },
    { id: 'exports-imports', label: 'Exports / Imports', page: 'exports-imports' },
    { id: 'quality', label: 'Quality', page: 'quality' },
    { id: 'contact', label: 'Contact Us', page: 'contact' }   
  ]

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
  
      {/* Main Header */}
      <div className="header-main">
        <div className="container">
          <div className="header-content">
            <div className="header-logo" onClick={() => setCurrentPage('home')}>
               <div className="logo-wrapper">
                <a href="/">
                  <img
                    src={logo}
                    alt="logo"
                    className="logo-image"
                  />
                </a>
              </div>
            </div>

            <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <ul className="nav-menu">
                {menuItems.map((item, index) => (
                  <li key={item.id} style={{ '--item-index': index }}>
                    <button
                      className={currentPage === item.page ? 'active' : ''}
                      onClick={() => {
                        setCurrentPage(item.page)
                        setMobileMenuOpen(false)
                      }}
                    >
                      <span className="nav-label">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="header-actions">
              <button 
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
