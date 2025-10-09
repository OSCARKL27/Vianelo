import React from 'react'
import { Card } from 'react-bootstrap'

export default function ProductCard({item}){
  return (
    <Card className="h-100">
      <Card.Img variant="top" src={item.image ? `/public/${item.image}` : '/public/placeholder.jpg'} />
      <Card.Body className="d-flex flex-column">
        <Card.Title>{item.name}</Card.Title>
        <Card.Text>{item.description}</Card.Text>
        <div className="mt-auto"><span className="price">${item.price} MXN</span></div>
      </Card.Body>
    </Card>
  )
}
