// src/lib/reservations.js
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * createReservation(payload)
 * payload: { user: { uid, email }, item: { id, name, price }, orderId }
 * returns: { id, ref } (docRef)
 */
export async function createReservation({ user, item, orderId }) {
  if (!user || !user.uid) throw new Error("User must be authenticated to create reservation.");

  const data = {
    uid: user.uid,
    userEmail: user.email || null,
    itemId: item.id,
    title: item.name || item.title || item.id,
    price: item.price || 0,
    orderId: orderId || null,
    status: "reserved",
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "reservations"), data);
  return { id: ref.id, ref };
}

/**
 * cancelReservation(reservationId, cancelledByUid)
 * sets status = "cancelled", cancelledAt, cancelledBy
 */
export async function cancelReservation(reservationId, cancelledByUid = null) {
  if (!reservationId) throw new Error("reservationId required");
  const ref = doc(db, "reservations", reservationId);
  await updateDoc(ref, {
    status: "cancelled",
    cancelledAt: serverTimestamp(),
    cancelledBy: cancelledByUid || null,
  });
  return { id: reservationId };
}
