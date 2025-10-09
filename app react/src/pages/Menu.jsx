import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import ProductCard from '../components/ProductCard'
import menuData from '../data/menu.json'

export default function Menu(){
  return (
    <Container className="py-5">
      <h1 className="section-title">Menú</h1>
      <Row className="g-3">
        {menuData.items.map(it=>(<Col md={4} key={it.id}><ProductCard item={it} /></Col>))}
      </Row>
    </Container>
  )
}
