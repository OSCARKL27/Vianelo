import { Container, Row, Col, Card, Button } from "react-bootstrap";

const sucursales = [
  {
    id: "Quintas",
    nombre: "Vianelo Quintas",
    direccion: "Calle Gral Rafael Buelna Tenorio 1081, Las Quintas, 80060 Culiacán Rosales, Sin.",
    horario: "Lunes a Domingo · 8:00 am – 8:00 pm",
    telefono: "667 416 6010",
    mapsUrl: "https://maps.app.goo.gl/sQFQuRTDHy4rFVDK6",
    // 👇 SOLO la URL del src (entre comillas)
    embedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7242.763684162379!2d-107.39171440771074!3d24.816612161831376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86bcd742372410cf%3A0x7863bfb51e7afc52!2sVianelo%20Reposter%C3%ADa%20y%20Caf%C3%A9!5e0!3m2!1ses-419!2smx!4v1764603004858!5m2!1ses-419!2smx",
  },
  {
    id: "Chapule",
    nombre: "Vianelo Chapule",
    direccion: "Esquina con, Juan de la Barrera, C. Josefa Ortiz de Domínguez 246-local 2, Chapultepec, 80030 Culiacán Rosales, Sin.",
    horario: "Lunes a Domingo · 8:00 am – 8:00 pm",
    telefono: "667 118 1013",
    mapsUrl: "https://maps.app.goo.gl/vvfGPm16oWwLFpun9",
    embedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7242.508140287162!2d-107.4015970064209!3d24.820983500000015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86bcdbe5fb1900bb%3A0x89bd035772818f15!2sVianelo%20Reposter%C3%ADa%20y%20Caf%C3%A9!5e0!3m2!1ses-419!2smx!4v1764609377026!5m2!1ses-419!2smx",
  },
];

export default function SucursalesPage() {
  return (
    <Container className="py-5">
      <header className="text-center text-white mb-5">
        <h1 className="fw-bold">Nuestras sucursales</h1>
        <p className="text-white-55 mb-0">
          Encuentra tu Vianelo más cercano y disfruta de tu bebida favorita.
        </p>
      </header>

      <Row className="g-4">
        {sucursales.map((sucursal) => (
          <Col key={sucursal.id} md={6}>
            <Card className="h-100 shadow-sm border-0 rounded-4">
              <div className="ratio ratio-16x9 rounded-top-4 overflow-hidden">
                <iframe
                  src={sucursal.embedSrc}
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={sucursal.nombre}
                ></iframe>
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fw-bold mb-2">
                  {sucursal.nombre}
                </Card.Title>
                <Card.Text className="mb-1">
                  <strong>Dirección:</strong> {sucursal.direccion}
                </Card.Text>
                <Card.Text className="mb-1">
                  <strong>Horario:</strong> {sucursal.horario}
                </Card.Text>
                <Card.Text className="mb-3">
                  <strong>Teléfono:</strong> {sucursal.telefono}
                </Card.Text>
                <div className="mt-auto text-end">
                  <Button id="btn-add"
                    variant="primary"
                    onClick={() => window.open(sucursal.mapsUrl, "_blank")}
                  >
                    Abrir en Google Maps
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
