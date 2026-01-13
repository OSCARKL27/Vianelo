import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const CartCtx = createContext(null)

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart debe usarse dentro de un <CartProvider>')
  return ctx
}

const LS_KEY = 'cart_vianelo'

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [lastAdded, setLastAdded] = useState(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
      setItems(saved)
    } catch (e) {
      console.error('Error leyendo carrito de localStorage', e)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items))
  }, [items])

  function addToCart(product, qty = 1) {
    if (!product || !product.id) return

    const maxStock = Number(product.stock ?? Infinity)
    const safeQty = Math.max(1, Number(qty || 1))

    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id)

      if (idx >= 0) {
        const copy = [...prev]
        const current = copy[idx]
        const currentMax = Number(current.maxStock ?? maxStock ?? Infinity)

        const nextQty = Math.min(current.qty + safeQty, currentMax)

        copy[idx] = { ...current, qty: nextQty, maxStock: currentMax }
        return copy
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          imageUrl: product.imageUrl || '',
          qty: Math.min(safeQty, maxStock),
          maxStock: maxStock, // ✅ guardamos stock al momento de agregar
        },
      ]
    })

    setLastAdded({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      imageUrl: product.imageUrl || '',
    })
    setTimeout(() => setLastAdded(null), 2500)
  }

  function removeFromCart(id) {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  function updateQty(id, qty) {
    const n = Math.max(0, Number(qty || 0))
    setItems((prev) =>
      prev
        .map((p) => {
          if (p.id !== id) return p
          const maxStock = Number(p.maxStock ?? Infinity)
          return { ...p, qty: Math.min(n, maxStock) }
        })
        .filter((p) => p.qty > 0)
    )
  }

  function increaseQty(id) {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const maxStock = Number(p.maxStock ?? Infinity)
        const next = p.qty + 1
        return { ...p, qty: Math.min(next, maxStock) }
      })
    )
  }

  function decreaseQty(id) {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0)
    )
  }

  function clearCart() {
    setItems([])
    localStorage.removeItem(LS_KEY)
  }

  // ✅ limpiar carrito al logout
  useEffect(() => {
    const auth = getAuth()
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setItems([])
        localStorage.removeItem(LS_KEY)
        setLastAdded(null)
      }
    })
    return () => unsub()
  }, [])

  const total = useMemo(() => items.reduce((acc, p) => acc + p.price * p.qty, 0), [items])
  const count = useMemo(() => items.reduce((acc, p) => acc + p.qty, 0), [items])

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQty,
    increaseQty,
    decreaseQty,
    clearCart,
    total,
    count,
    lastAdded,
  }

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}
