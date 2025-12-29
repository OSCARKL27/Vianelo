import { PayPalButtons } from '@paypal/react-paypal-js'

export default function PayPalButton({ total, onSuccess, disabled }) {
  if (disabled) return null

  return (
    <PayPalButtons
      style={{ layout: 'vertical' }}

      // 🔹 Crear la orden
      createOrder={(data, actions) => {
        console.log('Creando orden PayPal...')
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: total.toFixed(2),
              },
            },
          ],
        })
      }}

      // 🔹 Aprobar y CAPTURAR el pago
      onApprove={async (data, actions) => {
        try {
          console.log('Orden aprobada:', data)

          const details = await actions.order.capture()

          console.log('Pago capturado:', details)

          if (details.status === 'COMPLETED') {
            alert('Pago COMPLETADO en Sandbox ✅')
            onSuccess(details)
          } else {
            console.error('Pago NO completado:', details)
            alert('El pago no se completó correctamente')
          }
        } catch (err) {
          console.error('Error capturando el pago:', err)
          alert('Error al capturar el pago')
        }
      }}

      // 🔹 Error general de PayPal
      onError={(err) => {
        console.error('Error en PayPal:', err)
        alert('Ocurrió un error con PayPal')
      }}
    />
  )
}
