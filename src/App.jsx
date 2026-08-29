import { useEffect, useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import Footer from './components/Footer'
import Header from './components/Header'
import About from './pages/About'
import Contact from './pages/Contact'

import Home from './pages/Home'
import Inquiry from './pages/Inquiry'
import ProductDetail from './pages/ProductDetail'
import Products from './pages/Products'
import Quality from './pages/Quality'

// Dynamic CMS page imports
import Blog from './pages/Blog'
import Careers from './pages/Careers'
import Gallery from './pages/Gallery'
import Harvest from './pages/Harvest'

// Preloaders
import Preloader from './components/Preloader'

// Admin panel imports
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'

// API helpers
import { fetchContentApi, fetchProductsApi, fetchInquiriesApi, fetchMenuApi } from './utils/api'
import { DEFAULT_WEBSITE_CONTENT } from './utils/storage'

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('sangath_current_page') || 'home'
  })

  // Full-screen initial Preloader state
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isPreloaderExiting, setIsPreloaderExiting] = useState(false)

  // Persist current page to localStorage so it survives page refresh
  useEffect(() => {
    localStorage.setItem('sangath_current_page', currentPage)
  }, [currentPage])

  const [selectedProduct, setSelectedProduct] = useState(() => {
    const savedProd = localStorage.getItem('sangath_selected_product')
    return savedProd ? JSON.parse(savedProd) : null
  })

  // Persist selected product as well
  useEffect(() => {
    if (selectedProduct) {
      localStorage.setItem('sangath_selected_product', JSON.stringify(selectedProduct))
    } else {
      localStorage.removeItem('sangath_selected_product')
    }
  }, [selectedProduct])
  
  // 1. CMS Web Content State
  const [websiteContent, setWebsiteContent] = useState(DEFAULT_WEBSITE_CONTENT)
  
  // 2. Product Categories State
  const [categories, setCategories] = useState([])
  
  // 3. Customer Inquiries State
  const [inquiries, setInquiries] = useState([])
  
  // 4. Admin Auth Session State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

  // 5. Menu Items State
  const [menuItems, setMenuItems] = useState([])

  // Fetch initial content and products from API
  useEffect(() => {
    // Purge legacy media cache if present to prevent stale dummy fallbacks
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.delete('sangath-media-cache-v1').catch(() => {});
    }

    const loadStartTime = Date.now();
    const MIN_PRELOADER_TIME = 800; // Guarantee smooth luxury entrance

    const contentPromise = fetchContentApi()
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setWebsiteContent(data);
        }
      })
      .catch(err => console.error('Failed to load website content from API:', err));

    const productsPromise = fetchProductsApi()
      .then(data => {
        if (data && data.categories) {
          setCategories(data.categories);
        }
      })
      .catch(err => console.error('Failed to load products from API:', err));

    const menuPromise = fetchMenuApi()
      .then(data => {
        if (data && Array.isArray(data)) {
          setMenuItems(data);
        }
      })
      .catch(err => console.error('Failed to load menu from API:', err));

    // Wait for critical data and smooth minimum delay before fading out preloader
    Promise.allSettled([contentPromise, productsPromise, menuPromise]).then(() => {
      const elapsed = Date.now() - loadStartTime;
      const remaining = Math.max(0, MIN_PRELOADER_TIME - elapsed);
      
      setTimeout(() => {
        setIsPreloaderExiting(true);
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 550); // Match CSS transition duration
      }, remaining);
    });

    // Safety fallback: ensure preloader dismisses even on network failure
    const fallbackTimer = setTimeout(() => {
      setIsPreloaderExiting(true);
      setTimeout(() => setIsInitialLoading(false), 550);
    }, 3500);

    return () => clearTimeout(fallbackTimer);
  }, []);

  // Sync SEO Metadata from CMS state on change
  useEffect(() => {
    if (websiteContent && websiteContent.general) {
      document.title = websiteContent.general.siteTitle || 'Sangath Global Exim';
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', websiteContent.general.metaDescription || '');
      }
      
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', websiteContent.general.metaKeywords || '');
      }
    }
  }, [websiteContent])

  // Admin Session Expiry Watchdog
  useEffect(() => {
    const sessionToken = sessionStorage.getItem('sangath_admin_session_token');
    const sessionExpiry = sessionStorage.getItem('sangath_admin_session_expiry');
    
    /* eslint-disable react-hooks/set-state-in-effect */
    if (sessionToken && sessionExpiry) {
      if (Date.now() < parseInt(sessionExpiry, 10)) {
        setIsAdminLoggedIn(true);
      } else {
        // Session expired, clear tokens
        sessionStorage.removeItem('sangath_admin_session_token');
        sessionStorage.removeItem('sangath_admin_session_expiry');
        setIsAdminLoggedIn(false);
        if (currentPage === 'admin') {
          setCurrentPage('admin-login');
        }
      }
    } else {
      setIsAdminLoggedIn(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [currentPage])

  // Fetch inquiries when admin is logged in
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchInquiriesApi()
        .then(res => {
          if (res && res.inquiries) {
            setInquiries(res.inquiries);
          }
        })
        .catch(err => console.error('Failed to load inquiries:', err));
    }
  }, [isAdminLoggedIn]);

  // Helper to refresh categories database from API
  const refreshCategories = () => {
    fetchProductsApi()
      .then(data => {
        if (data && data.categories) setCategories(data.categories);
      })
      .catch(err => console.error('Refresh categories failed:', err));
  };



  // Helper to refresh inquiries list in React state
  const handleRefreshInquiries = () => {
    fetchInquiriesApi()
      .then(res => {
        if (res && res.inquiries) setInquiries(res.inquiries);
      })
      .catch(err => console.error('Refresh inquiries failed:', err));
  };

  // Helper to refresh menu from API
  const refreshMenu = () => {
    fetchMenuApi()
      .then(data => {
        if (data && Array.isArray(data)) setMenuItems(data);
      })
      .catch(err => console.error('Refresh menu failed:', err));
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setCurrentPage('product-detail')
  }

  const renderPage = () => {
    // Admin routing
    if (currentPage === 'admin-login') {
      return (
        <AdminLogin 
          setIsAdminLoggedIn={setIsAdminLoggedIn} 
          setCurrentPage={setCurrentPage} 
          websiteContent={websiteContent}
        />
      )
    }

    if (currentPage === 'admin') {
      if (!isAdminLoggedIn) {
        return (
          <AdminLogin 
            setIsAdminLoggedIn={setIsAdminLoggedIn} 
            setCurrentPage={setCurrentPage} 
            websiteContent={websiteContent}
          />
        )
      }
      return (
        <Admin 
          categories={categories}
          updateCategories={refreshCategories}
          websiteContent={websiteContent}
          updateWebsiteContent={setWebsiteContent}
          inquiries={inquiries}
          setInquiries={setInquiries}
          menuItems={menuItems}
          refreshMenu={refreshMenu}
          setIsAdminLoggedIn={setIsAdminLoggedIn}
          setCurrentPage={setCurrentPage}
        />
      )
    }

    if (currentPage === 'product-detail' && selectedProduct) {
      return (
        <ProductDetail 
          product={selectedProduct} 
          onBack={() => setCurrentPage('products')}
          categories={categories}
          onSelectProduct={setSelectedProduct}
        />
      )
    }

    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} websiteContent={websiteContent} />
      case 'products':
        return (
          <Products 
            setCurrentPage={setCurrentPage} 
            onViewDetails={handleViewProduct} 
            categories={categories}
            websiteContent={websiteContent}
          />
        )
      case 'about':
        return <About websiteContent={websiteContent} />

      case 'quality':
        return <Quality websiteContent={websiteContent} />
      case 'contact':
        return <Contact websiteContent={websiteContent} onRefreshInquiries={handleRefreshInquiries} />
      case 'inquiry':
        return <Inquiry websiteContent={websiteContent} onRefreshInquiries={handleRefreshInquiries} />
      case 'blog':
        return <Blog websiteContent={websiteContent} />
      case 'careers':
        return <Careers websiteContent={websiteContent} />
      case 'gallery':
        return <Gallery websiteContent={websiteContent} />
      case 'harvest':
        return <Harvest websiteContent={websiteContent} />
      default:
        return <Home setCurrentPage={setCurrentPage} websiteContent={websiteContent} />
    }
  }

  // Hide header and footer inside full admin view
  const isMinimalLayout = currentPage === 'admin' || currentPage === 'admin-login';

  return (
    <div className="app">
      {/* Full-Screen Glassmorphism Website Preloader */}
      {isInitialLoading && (
        <Preloader 
          isExiting={isPreloaderExiting} 
          brandName={websiteContent?.general?.logoText} 
          logoImage={websiteContent?.general?.logoImage}
        />
      )}

      {!isMinimalLayout && (
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          websiteContent={websiteContent}
          isAdminLoggedIn={isAdminLoggedIn}
          menuItems={menuItems}
        />
      )}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage === 'product-detail' ? `product-${selectedProduct?.id}` : currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease: "easeInOut" }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      {!isMinimalLayout && (
        <Footer 
          setCurrentPage={setCurrentPage} 
          websiteContent={websiteContent}
          menuItems={menuItems}
        />
      )}
    </div>
  )
}

export default App
