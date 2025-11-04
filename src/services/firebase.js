import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ importamos Firestore
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyChSKQRju4JOYwoCDiDWwQB5S7EZmLOnJk",
  authDomain: "vianelo-26cd0.firebaseapp.com",
  projectId: "vianelo-26cd0",
  storageBucket: "vianelo-26cd0.appspot.com",
  messagingSenderId: "643755407371",
  appId: "1:643755407371:web:9110dc4dd9b1764dd5af0e",
  measurementId: "G-50G9RN6JN0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // ✅ exportamos la base de datos
export const storage = getStorage(app);

export { createUserWithEmailAndPassword };
export default app;
