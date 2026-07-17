import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AdminApp from './App.admin.jsx'
import './styles/admin.css'

const rootElement = document.getElementById('root')

createRoot(rootElement).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
)
