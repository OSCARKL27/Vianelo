import { PayPalButtons } from '@paypal/react-paypal-js'
import { useCart } from '../context/CartContext'

// 🔥 Firestore
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
} from 'firebase/firestore'
import { db } from '../services/firebase'

export default function PayPalButton({ total, onSuccess, disabled, branchId }) {
  const { items, clearCart } = useCart()

  if (disabled || items.length === 0) return null

  return (
    <PayPalButtons
      style={{ layout: 'vertical' }}

      // 🔹 Crear la orden
      createOrder={(data, actions) =>
        actions.order.create({
          purchase_units: [
            {
              amount: {
                value: Number(total || 0).toFixed(2),
              },
            },
          ],
        })
      }

      // 🔹 Aprobar y capturar pago
      onApprove={async (data, actions) => {
        try {
          const details = await actions.order.capture()
          console.log('Pago capturado:', details)

          // ==========================================
          // 1) 📉 BAJAR STOCK (products/{id}.stock)
          // ==========================================
          await runTransaction(db, async (tx) => {
            for (const it of items) {
              const productId = it.id
              const qty = Number(it.qty || 0)

              if (!productId) throw new Error('Un producto del carrito no trae id.')
              if (!qty || qty <= 0) continue

              const productRef = doc(db, 'products', productId)
              const snap = await tx.get(productRef)

              if (!snap.exists()) {
                throw new Error(`Producto no existe: ${productId}`)
              }

              const currentStock = Number(snap.data().stock || 0)
              const nextStock = currentStock - qty

              if (nextStock < 0) {
                throw new Error(
                  `Stock insuficiente para "${snap.data().name || it.name}". Disponible: ${currentStock}`
                )
              }

              tx.update(productRef, { stock: nextStock })
            }
          })

          // ==========================================
          // 2) 📦 REGISTRAR PEDIDO (orders)
          // ==========================================
          const orderRef = await addDoc(collection(db, 'orders'), {
            items,
            total,
            branchId: String(branchId || '').trim(), // 👈 recomendado para sucursal
            paypalOrderId: details.id,
            paymentStatus: 'paid',
            status: 'paid', // tu sucursal ya lo mapea a "enviado"
            createdAt: serverTimestamp(),
          })

          // ==========================================
          // 3) 📊 REGISTRAR VENTA (sales) para tu reporte
          // ==========================================
          await addDoc(collection(db, 'sales'), {
            orderId: orderRef.id,
            total,
            branchId: String(branchId || '').trim(),
            date: serverTimestamp(), // 👈 tu AdminDashboard usa "date"
            items: items.map((it) => ({
              id: it.id,
              name: it.name,
              quantity: Number(it.qty || 0), // 👈 tu reporte usa "quantity"
            })),
          })

          // ==========================================
          // 🧹 LIMPIAR CARRITO
          // ==========================================
          clearCart()

          alert('Pago COMPLETADO ✅ (Stock y venta registrados)')
          onSuccess?.(details)
        } catch (error) {
          console.error('🔥 ERROR REAL:', error)
          alert(error?.message || 'Error al procesar el pago')
        }
      }}

      // 🔹 Error general de PayPal
      onError={(err) => {
        console.error('Error PayPal:', err)
        alert('Error con PayPal')
      }}
    />
  )
}
