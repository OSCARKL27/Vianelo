/* global firebase */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyChSKQRju4JOYwoCDiDWwQB5S7EZmLOnJk",
  authDomain: "vianelo-26cd0.firebaseapp.com",
  projectId: "vianelo-26cd0",
  storageBucket: "vianelo-26cd0.firebasestorage.app",
  messagingSenderId: "643755407371",
  appId: "1:643755407371:web:9110dc4dd9b1764dd5af0e",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "Vianelo";
  const options = {
    body: payload?.notification?.body || "Tienes una actualización",
    icon: "/icon-192.png", // si tienes icono PWA
  };

  self.registration.showNotification(title, options);
});

