import { useEffect, useState } from 'react'
import './App.css'
import Footer from './components/Footer'
import Header from './components/Header'
import About from './pages/About'
import Contact from './pages/Contact'
import ExportsImports from './pages/ExportsImports'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Products from './pages/Products'
import Quality from './pages/Quality'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [categories, setCategories] = useState([])

  // Load products to have them available for detail navigation
  useEffect(() => {
    fetch('/products.json')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error('App products load error', err))
  }, [])

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setCurrentPage('product-detail')
  }

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
