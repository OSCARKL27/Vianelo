import { useEffect, useState } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../services/firebase'

/**
 * Hook centralizado para CRUD de productos + subida de imágenes.
 * - Guarda imageUrl con token (getDownloadURL) => evita 403/CORS.
 * - Guarda imagePath para poder borrar/actualizar.
 * - Convierte price/stock a número.
 */
export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const colRef = collection(db, 'products')

  useEffect(() => {
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setProducts(list)
        setLoading(false)
      },
      (err) => {
        console.error('onSnapshot error(products):', err)
        setError(err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  function sanitizeFileName(name = '') {
    return name.replace(/\s+/g, '_').replace(/[^\w.\-]/g, '')
  }

  async function uploadImage(file, existingPath) {
    if (!file) return { imageUrl: null, imagePath: null }

    // si hay imagen previa, la intentamos borrar
    if (existingPath) {
      try {
        await deleteObject(ref(storage, existingPath))
      } catch (e) {
        // si no existe o no hay permiso, seguimos
        console.warn('No se pudo borrar imagen previa:', existingPath, e?.code)
      }
    }

    const safeName = sanitizeFileName(file.name)
    const path = `products/${Date.now()}_${safeName}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef) // URL con token ✅
    return { imageUrl: url, imagePath: path }
  }

  async function createProduct(data, file) {
    try {
      const { imageUrl, imagePath } = await uploadImage(file)
      await addDoc(colRef, {
        name: data.name || '',
        description: data.description || '',
        category: data.category || '',
        price: Number(data.price ?? 0),
        stock: Number(data.stock ?? 0),
        isActive: data.isActive ?? true,
        imageUrl: imageUrl || '',
        imagePath: imagePath || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('createProduct error:', e)
      setError(e)
      throw e
    }
  }

  async function updateProduct(id, data, file, currentImagePath) {
    try {
      const docRef = doc(db, 'products', id)
      const patch = {
        name: data.name ?? '',
        description: data.description ?? '',
        category: data.category ?? '',
        price: Number(data.price ?? 0),
        stock: Number(data.stock ?? 0),
        isActive: data.isActive ?? true,
        updatedAt: serverTimestamp(),
      }

      if (file) {
        const { imageUrl, imagePath } = await uploadImage(file, currentImagePath)
        patch.imageUrl = imageUrl || ''
        patch.imagePath = imagePath || ''
      }

      await updateDoc(docRef, patch)
    } catch (e) {
      console.error('updateProduct error:', e)
      setError(e)
      throw e
    }
  }

  async function removeProduct(id, imagePath) {
    try {
      await deleteDoc(doc(db, 'products', id))
      if (imagePath) {
        try {
          await deleteObject(ref(storage, imagePath))
        } catch (e) {
          console.warn('No se pudo borrar la imagen asociada:', imagePath, e?.code)
        }
      }
    } catch (e) {
      console.error('removeProduct error:', e)
      setError(e)
      throw e
    }
  }

  return { products, loading, error, createProduct, updateProduct, removeProduct }
}
