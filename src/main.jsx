import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import {  LanguageProvider } from './Components/Context/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <LanguageProvider>
    <StrictMode>
    <App />
  </StrictMode>
    </LanguageProvider>
  
  </BrowserRouter>
)
