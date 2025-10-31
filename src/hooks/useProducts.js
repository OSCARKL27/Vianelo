import { useEffect, useState } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../services/firebase'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const colRef = collection(db, 'products')

  useEffect(() => {
    const unsub = onSnapshot(colRef, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setProducts(list)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function uploadImage(file, existingPath) {
    if (!file) return { imageUrl: null, imagePath: null }
    if (existingPath) { try { await deleteObject(ref(storage, existingPath)) } catch {} }
    const path = `products/${Date.now()}_${file.name}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    return { imageUrl: url, imagePath: path }
  }

  async function createProduct(data, file) {
    const { imageUrl, imagePath } = await uploadImage(file)
    await addDoc(colRef, {
      ...data,
      imageUrl: imageUrl || '',
      imagePath: imagePath || '',
      stock: Number(data.stock ?? 0),
      price: Number(data.price ?? 0),
      isActive: data.isActive ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function updateProduct(id, data, file, currentImagePath) {
    const docRef = doc(db, 'products', id)
    const patch = {
      ...data,
      stock: Number(data.stock ?? 0),
      price: Number(data.price ?? 0),
      updatedAt: serverTimestamp(),
    }
    if (file) {
      const { imageUrl, imagePath } = await uploadImage(file, currentImagePath)
      patch.imageUrl = imageUrl || ''
      patch.imagePath = imagePath || ''
    }
    await updateDoc(docRef, patch)
  }

  async function removeProduct(id, imagePath) {
    await deleteDoc(doc(db, 'products', id))
    if (imagePath) { try { await deleteObject(ref(storage, imagePath)) } catch {} }
  }

  return { products, loading, createProduct, updateProduct, removeProduct }
}
