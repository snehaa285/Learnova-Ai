import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ADD THE BASENAME RIGHT HERE */}
    <BrowserRouter basename="/Learnova-Ai/">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)