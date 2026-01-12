import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

import { AuthProvider } from './context/AuthContext'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

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
