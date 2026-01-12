// src/components/GlobalNotifications.jsx
import { useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { enablePushForUser } from '../services/notifications'

export default function GlobalNotifications() {
  useEffect(() => {
    const auth = getAuth()

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        enablePushForUser(user).catch(console.error)
      }
    })

    return () => unsub()
  }, [])

  return null // No renderiza nada
}
