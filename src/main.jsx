import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

// 👇 Importa el AuthProvider que creaste
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ Envolvemos toda la app para compartir el estado de autenticación */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
