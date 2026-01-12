[11:55 AM, 1/12/2026] OL:   └── @paypal/paypal-js@9.0.1
[11:57 AM, 1/12/2026] OL: import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@paypal/react-paypal-js', '@paypal/paypal-js']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})