import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
    ssr: {
    noExternal: ['react', 'react-dom', '@paypal/react-paypal-js']
  }
})