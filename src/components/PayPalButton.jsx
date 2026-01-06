import { PayPalButtons } from '@paypal/react-paypal-js'
import { useCart } from '../context/CartContext'

// 🔥 Firestore
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'

export default function PayPalButton({ total, onSuccess, disabled }) {
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
                value: total.toFixed(2),
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

          // ===============================
          // 📦 REGISTRAR PEDIDO (orders)
          // ===============================
          await addDoc(collection(db, 'orders'), {
            items,
            total,
            paypalOrderId: details.id,
            status: 'paid',
            createdAt: serverTimestamp(),
          })

          // ===============================
          // 🧹 LIMPIAR CARRITO
          // ===============================
          clearCart()

          alert('Pago COMPLETADO en Sandbox ✅')
          onSuccess?.(details)

        } catch (error) {
          console.error('🔥 ERROR REAL:', error)
          alert('Error al procesar el pago')
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
