import { getToken } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { messaging, db } from "./firebase";

export async function enablePushForUser(user) {
  if (!user) return null;
  if (!("Notification" in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  // IMPORTANTE: tu VAPID key en env
  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });

  if (!token) return null;

  // Guardar token en Firestore (soporta múltiples dispositivos)
  await setDoc(
    doc(db, "users", user.uid, "fcmTokens", token),
    { token, createdAt: serverTimestamp() },
    { merge: true }
  );

  return token;
}
