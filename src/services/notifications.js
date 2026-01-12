import { getToken } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { messaging, db } from "./firebase";

export async function enablePushForUser(user) {
  if (!user) return null;
  if (!("Notification" in window)) return null;

  const permission = await Notification.requestPermission();
  console.log("🔔 Permission:", permission);
  if (permission !== "granted") return null;

  // ✅ Asegura que el SW esté listo
  const swReg = await navigator.serviceWorker.ready;
  console.log("✅ SW listo:", swReg.scope);

  // ✅ Pide token
  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });

  console.log("✅ FCM TOKEN:", token);

  if (!token) {
    console.error("❌ No se pudo obtener token (token null). Revisa VAPID/FCM)");
    return null;
  }

  // ✅ 1) Crear/asegurar el doc padre (para que lo VEAS en la consola)
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // ✅ 2) Guardar token en subcolección
  await setDoc(
    doc(db, "users", user.uid, "fcmTokens", token),
    {
      token,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent,
    },
    { merge: true }
  );

  console.log("✅ Token guardado en Firestore");
  return token;
}
