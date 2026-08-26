import { Menu, X, User, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from "../assets/logo.png";
import { fetchProductsApi } from '../utils/api';
import './Header.css';

function Header({ currentPage, setCurrentPage, websiteContent, isAdminLoggedIn, menuItems = [] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  
  // Search & Cart states
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Dynamically calculate and sync exact header height to CSS variable --header-height
  useEffect(() => {
    const headerEl = document.querySelector('.header');
    if (!headerEl) return;
    const updateHeaderHeight = () => {
      const h = headerEl.offsetHeight;
      if (h > 0) {
        document.documentElement.style.setProperty('--header-height', `${h}px`);
      }
    };
    updateHeaderHeight();
    const ro = new ResizeObserver(updateHeaderHeight);
    ro.observe(headerEl);
    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, [scrolled, mobileMenuOpen])


  // Live product search
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    
    fetchProductsApi()
      .then(data => {
        const allProducts = [];
        (data.categories || []).forEach(cat => {
          (cat.products || []).forEach(p => {
            allProducts.push({ ...p, categoryName: cat.name });
          });
        });
        
        const filtered = allProducts.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered.slice(0, 5));
      })
      .catch(err => console.error('Search fetch error:', err));
  }, [searchQuery])

  const handleSearchResultClick = (product) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    
    // Direct detail view selection
    try {
      // Find the actual product in state and trigger details
      const customEvent = new CustomEvent('sangath_view_product', { detail: product });
      window.dispatchEvent(customEvent);
    } catch (e) {
      console.error(e);
    }
    setCurrentPage('products');
  }

  // Get brand name and logo from CMS settings
  const brandName = websiteContent?.general?.logoText || "Sangath Global Exim";
  const customLogo = websiteContent?.general?.logoImage;

  const handleProfileClick = () => {
    if (isAdminLoggedIn) {
      setCurrentPage('admin');
    } else {
      setCurrentPage('admin-login');
    }
  }

  const handleNavClick = (item) => {
    if (item.external_url) {
      window.open(item.external_url, '_blank');
      return;
    }
    if (item.page) {
      setCurrentPage(item.page);
      setMobileMenuOpen(false);
      setSearchOpen(false);
      setDropdownOpen(null);
    }
  }

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
      <div className="header-main">
        <div className="container">
          <div className="header-content">
            
            {/* Brand Logo */}
            <div className="header-logo" onClick={() => setCurrentPage('home')}>
              <div className="logo-wrapper">
                <img
                  src={customLogo || logo}
                  alt={brandName}
                  className="logo-image"
                />
                <div className="logo-text-group">
                  <span className="logo-text-primary">
                    {brandName.split(' ')[0] || 'Sangath'}
                  </span>
                  <span className="logo-text-secondary">
                    {brandName.split(' ').slice(1).join(' ') || 'Global Exim'}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Menu Nav */}
            <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <ul className="nav-menu">
                {menuItems.filter(item => item.is_visible).map((item, index) => (
                  <li 
                    key={item.id} 
                    style={{ '--item-index': index }}
                    className={item.children?.length > 0 ? 'has-dropdown' : ''}
                    onMouseEnter={() => setDropdownOpen(item.id)}
                    onMouseLeave={() => setDropdownOpen(null)}
                  >
                    <button
                      className={currentPage === item.page ? 'active' : ''}
                      onClick={() => {
                        // On mobile, clicking a parent toggles dropdown, on desktop it navigates
                        if (mobileMenuOpen && item.children?.length > 0) {
                          setDropdownOpen(dropdownOpen === item.id ? null : item.id);
                        } else {
                          handleNavClick(item);
                        }
                      }}
                    >
                      <span className="nav-label">{item.label}</span>
                      {item.children?.length > 0 && (
                        <span className={`dropdown-arrow ${dropdownOpen === item.id ? 'open' : ''}`}>▼</span>
                      )}
                    </button>
                    
                    {item.children?.length > 0 && dropdownOpen === item.id && (
                      <ul className="dropdown-menu">
                        {item.children.filter(child => child.is_visible).map(child => (
                          <li key={child.id}>
                            <button onClick={() => handleNavClick(child)}>
                              {child.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Quick Actions Panel */}
            <div className="header-actions">
              {/* Live Search Trigger */}
              <div className="action-search-container">
                <button 
                  className={`action-btn search-trigger ${searchOpen ? 'active' : ''}`}
                  onClick={() => setSearchOpen(!searchOpen)}
                  aria-label="Search products"
                >
                  <Search size={20} />
                </button>
                {searchOpen && (
                  <div className="search-dropdown-overlay">
                    <div className="search-input-wrapper">
                      <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      <button className="search-close" onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}>
                        <X size={16} />
                      </button>
                    </div>
                    {searchResults.length > 0 && (
                      <ul className="search-results-list">
                        {searchResults.map(p => (
                          <li key={p.id} onClick={() => handleSearchResultClick(p)}>
                            <div className="search-result-item">
                              <img src={p.image} alt={p.name} className="result-thumb" />
                              <div>
                                <h4 className="result-name">{p.name}</h4>
                                <span className="result-category">{p.categoryName}</span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {searchQuery.trim() && searchResults.length === 0 && (
                      <div className="no-results-toast">No products found.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Admin profile switcher */}
              <button 
                className={`action-btn profile-trigger ${isAdminLoggedIn ? 'logged-in' : ''}`}
                onClick={handleProfileClick}
                aria-label="Admin settings"
                title={isAdminLoggedIn ? "Go to Admin Dashboard" : "Admin Login"}
              >
                <User size={20} />
                {isAdminLoggedIn && <span className="admin-status-dot"></span>}
              </button>

              {/* Mobile toggle */}
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
