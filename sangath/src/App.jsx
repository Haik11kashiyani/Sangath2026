import { useEffect, useState } from 'react'
import './App.css'
import Footer from './components/Footer'
import Header from './components/Header'
import About from './pages/About'
import Blog from './pages/Blog'
import Careers from './pages/Careers'
import Contact from './pages/Contact'
import ExportsImports from './pages/ExportsImports'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Products from './pages/Products'
import Quality from './pages/Quality'

function App() {
  const availablePages = ['home', 'products', 'product-detail', 'about', 'exports-imports', 'quality', 'contact', 'blog', 'careers']
  const [currentPage, setCurrentPage] = useState(() => {
    const hashValue = window.location.hash.slice(1)
    if (hashValue.startsWith('product-detail')) {
      return 'product-detail'
    }
    return availablePages.includes(hashValue) ? hashValue : 'home'
  })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [categories, setCategories] = useState([])

  // Persist page selection in the URL hash
  useEffect(() => {
    window.location.hash = currentPage
  }, [currentPage])

  // Load products from API
  useEffect(() => {
    const API_URL = 'http://localhost:5000/api';

    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        const groups = {};
        if (Array.isArray(data)) {
          data.forEach(product => {
            const categoryId = product.category_id || 'uncategorized';
            if (!groups[categoryId]) {
              groups[categoryId] = {
                id: categoryId,
                name: categoryId === 'uncategorized' ? 'General' : `Category ${categoryId.substring(0, 8)}`,
                products: []
              };
            }
            groups[categoryId].products.push(product);
          });
        }

        setCategories(Object.values(groups));
      })
      .catch(err => console.error('App products load error', err))
  }, [])

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setCurrentPage('product-detail')
    window.history.replaceState(null, '', `#product-detail-${product.id}`)
  }

  useEffect(() => {
    if (window.location.hash.startsWith('#product-detail-')) {
      const productId = window.location.hash.replace('#product-detail-', '')
      if (productId && categories.length > 0) {
        const found = categories.flatMap(category => category.products).find(product => product.id === productId)
        if (found) {
          setSelectedProduct(found)
          setCurrentPage('product-detail')
        }
      }
    }
  }, [categories])

  const renderPage = () => {
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
        return <Home setCurrentPage={setCurrentPage} />
      case 'products':
        return (
          <Products 
            setCurrentPage={setCurrentPage} 
            onViewDetails={handleViewProduct} 
          />
        )
      case 'about':
        return <About />
      case 'exports-imports':
        return <ExportsImports setCurrentPage={setCurrentPage} />
      case 'quality':
        return <Quality />
      case 'contact':
        return <Contact />
      case 'blog':
        return <Blog />
      case 'careers':
        return <Careers />
      default:
        return <Home setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <div className="app">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  )
}

export default App
