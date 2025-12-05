// src/lib/admin.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * checkIsAdmin(uid) -> boolean
 * Verifica se existe doc /admin/{uid} e se tem admin:true ou role:"admin".
 */
export async function checkIsAdmin(uid) {
  if (!uid) return false;
  try {
    const ref = doc(db, "admin", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const data = snap.data() || {};
    return data.admin === true || data.role === "admin" || data.isAdmin === true;
  } catch (err) {
    console.warn("checkIsAdmin error:", err);
    return false;
  }
}
