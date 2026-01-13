import { PayPalButtons } from '@paypal/react-paypal-js'
import { useCart } from '../context/CartContext'
import { collection, addDoc, serverTimestamp, doc, runTransaction } from 'firebase/firestore'
import { db } from '../services/firebase'
import { getAuth } from 'firebase/auth'

export default function PayPalButton({ total, onSuccess, disabled, branchId }) {
  const { items, clearCart } = useCart()

  if (disabled || items.length === 0) return null

  return (
    <PayPalButtons
      style={{ layout: 'vertical' }}

      createOrder={(data, actions) =>
        actions.order.create({
          purchase_units: [{ amount: { value: Number(total || 0).toFixed(2) } }],
        })
      }

      onApprove={async (data, actions) => {
        try {
          const details = await actions.order.capture()

          // ✅ auth requerido por tus rules
          const auth = getAuth()
          const user = auth.currentUser
          if (!user) throw new Error('Debes iniciar sesión para pagar.')

          const cleanBranch = String(branchId || '').trim()
          if (!cleanBranch) throw new Error('Selecciona una sucursal.')

          // ✅ Normaliza items (productId/id) (qty/quantity)
          const normalizedItems = items.map((it) => ({
            productId: it.productId || it.id,
            name: it.name,
            qty: Number(it.qty ?? it.quantity ?? 0),
            price: Number(it.price ?? 0),
          }))

          // 1) 📉 Bajar stock (transacción)
          await runTransaction(db, async (tx) => {
            for (const it of normalizedItems) {
              const productId = it.productId
              const qty = Number(it.qty || 0)

              if (!productId) throw new Error('Carrito: item sin productId.')
              if (!qty || qty <= 0) continue

              const productRef = doc(db, 'products', productId)
              const snap = await tx.get(productRef)
              if (!snap.exists()) throw new Error(`Producto no existe: ${productId}`)

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

          // 2) 📦 Guardar order (SOLO AQUÍ, para evitar duplicados)
          const orderRef = await addDoc(collection(db, 'orders'), {
            userId: user.uid,
            items: normalizedItems, // {productId,name,qty,price}
            total: Number(total || 0),
            branchId: cleanBranch,
            paypalOrderId: details.id,
            paymentStatus: 'paid',
            status: 'enviado',
            createdAt: serverTimestamp(),
          })

          // 3) 📊 Guardar sale (reporte)
          await addDoc(collection(db, 'sales'), {
            orderId: orderRef.id,
            userId: user.uid,
            total: Number(total || 0),
            branchId: cleanBranch,
            date: serverTimestamp(),
            items: normalizedItems.map((it) => ({
              id: it.productId,
              name: it.name,
              quantity: Number(it.qty || 0),
            })),
          })

          // 4) 🧹 limpiar carrito
          clearCart()

          // ✅ Devuelve orderId al CartPage para redirigir al success
          onSuccess?.({ details, orderId: orderRef.id })
        } catch (error) {
          console.error('🔥 ERROR REAL:', error)
          alert(error?.message || 'Error al procesar el pago')
        }
      }}

      onError={(err) => {
        console.error('Error PayPal:', err)
        alert('Error con PayPal')
      }}
    />
  )
}
