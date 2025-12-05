// src/lib/reservations.js
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * createReservation({ user, item, orderId })
 * - user: firebase user object (must have uid, email)
 * - item: { id, name, price }
 * - orderId: string
 *
 * returns { id, ref }
 */
export async function createReservation({ user, item, orderId }) {
  if (!user || !user.uid) throw new Error("User não autenticado");
  const payload = {
    uid: user.uid,
    userEmail: user.email || null,
    itemId: item.id,
    title: item.name || item.title || itemId,
    price: item.price || 0,
    orderId: orderId || null,
    status: "reserved",
    createdAt: serverTimestamp(),
  };

  const col = collection(db, "reservations");
  const docRef = await addDoc(col, payload);
  return { id: docRef.id, ref: docRef };
}

/**
 * cancelReservation(reservationId, opts)
 * - faz UPDATE do campo status -> "cancelled" e fecha com cancelledAt
 * - evita deleteDoc para prevenir problemas com listeners simultâneos
 */
export async function cancelReservation(reservationId, { cancelledByUid = null } = {}) {
  if (!reservationId) throw new Error("reservationId obrigatório");
  const rDoc = doc(db, "reservations", reservationId);

  await updateDoc(rDoc, {
    status: "cancelled",
    cancelledAt: serverTimestamp(),
    cancelledBy: cancelledByUid || null,
  });

  return { id: reservationId };
}
