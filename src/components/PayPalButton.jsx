import { PayPalButtons } from '@paypal/react-paypal-js'

export default function PayPalButton({ total, onSuccess, disabled }) {
  if (disabled) return null

  return (
    <PayPalButtons
      style={{ layout: 'vertical' }}
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
      onApprove={async (data, actions) => {
        const details = await actions.order.capture()
        onSuccess(details)
      }}
      onError={(err) => {
        console.error('Error en PayPal', err)
        alert('Ocurrió un error con el pago')
      }}
    />
  )
}
