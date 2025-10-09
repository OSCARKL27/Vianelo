
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyChSKQRju4JOYwoCDiDWwQB5S7EZmLOnJk",
  authDomain: "vianelo-26cd0.firebaseapp.com",
  projectId: "vianelo-26cd0",
  storageBucket: "vianelo-26cd0.firebasestorage.app",
  messagingSenderId: "643755407371",
  appId: "1:643755407371:web:9110dc4dd9b1764dd5af0e",
  measurementId: "G-50G9RN6JN0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);