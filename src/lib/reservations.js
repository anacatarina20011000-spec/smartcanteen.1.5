// src/lib/reservations.js
import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Cria uma reserva. Recebe explicitamente orderId (opcional).
 * @param {{user: {uid, email}, item: {id, name, price}, orderId?: string|null}} args
 */
export async function createReservation({ user, item, orderId = null }) {
  if (!user) throw new Error("Tem de iniciar sessão.");

  const payload = {
    uid: user.uid,
    userEmail: user.email || null,
    itemId: item.id,
    title: item.name || item.title || item.id,
    price: item.price || 0,
    status: "reserved",
    orderId: orderId || null,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, "reservations"), payload);
  return { id: docRef.id, data: payload };
}

export async function cancelReservation(reservationId) {
  if (!reservationId) throw new Error("reservationId required");
  await deleteDoc(doc(db, "reservations", reservationId));
  return { ok: true };
}
