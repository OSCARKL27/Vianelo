export default function InventoryBadge({ stock }) {
  if (Number(stock) <= 0) return <span className="badge bg-danger">Agotado</span>
  if (Number(stock) <= 5) return <span className="badge bg-warning">Bajo stock ({stock})</span>
  return <span className="badge bg-success">En stock ({stock})</span>
}
