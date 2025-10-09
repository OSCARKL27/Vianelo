import React from 'react'
import { Container } from 'react-bootstrap'
import AppNavbar from './components/AppNavbar'
import Home from './pages/Home'
import Footer from './components/Footer'


export default function App(){
  return (
    <div className="app-root">
      <AppNavbar />
      <Container fluid className="p-0">
        <Home />
      </Container>
      <Footer />
    </div>
  )
}
