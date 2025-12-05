// src/lib/reservations.js
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * createReservation({ user, item, orderId })
 * - user: firebase user object (must contain uid, email)
 * - item: { id, name, price }
 * - orderId: string
 *
 * Returns: { id, ref } (id = reservation doc id)
 */
export async function createReservation({ user, item, orderId }) {
  if (!user || !user.uid) throw new Error("Utilizador inválido.");
  const payload = {
    uid: user.uid,
    userEmail: user.email || null,
    itemId: item.id,
    title: item.name || item.title || "Menu",
    price: Number(item.price || 0),
    orderId: orderId || null,
    status: "reserved",
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "reservations"), payload);
  return { id: ref.id, ref };
}

/**
 * cancelReservation(reservationId, requestedByUid)
 * - marca a reserva como 'cancelled' (não apaga)
 */
export async function cancelReservation(reservationId, requestedByUid) {
  if (!reservationId) throw new Error("reservationId obrigatório");
  const rRef = doc(db, "reservations", reservationId);

  // Atualiza status (não apagar). Se quiseres, podes validar que requestedByUid === doc.uid
  await updateDoc(rRef, {
    status: "cancelled",
    cancelledBy: requestedByUid || null,
    cancelledAt: serverTimestamp(),
  });

  return { id: reservationId };
}
