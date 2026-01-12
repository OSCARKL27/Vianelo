import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

import { AuthProvider } from './context/AuthContext'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((reg) => console.log('✅ SW FCM registrado:', reg.scope))
    .catch((err) => console.error('❌ Error registrando SW FCM:', err))
    }
ReactDOM.createRoot(document.getElementById('root')).render(
  <PayPalScriptProvider
    options={{
      'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
      currency: 'USD',
    }}
  >
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  </PayPalScriptProvider>
)
