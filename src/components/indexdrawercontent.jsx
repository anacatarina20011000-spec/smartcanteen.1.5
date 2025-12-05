// src/components/indexdrawercontent.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/authcontext";
import { collection, query, where, orderBy, onSnapshot, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { cancelReservation as cancelReservationHelper } from "../lib/reservations";
import { checkIsAdmin } from "../lib/admin";

export default function IndexDrawerContent({ onClose }) {
  const { currentUser, logout } = useAuth();
  const uid = currentUser?.uid || null;

  const [tab, setTab] = useState("profile");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // subscrição realtime das reservas do user
  useEffect(() => {
    if (!uid) {
      setReservations([]);
      return;
    }
    setLoading(true);
    const q = query(collection(db, "reservations"), where("uid", "==", uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snapshot => {
      const arr = [];
      snapshot.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setReservations(arr);
      setLoading(false);
    }, err => {
      console.error("reservations onSnapshot error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  // check admin
  useEffect(() => {
    if (!uid) { setIsAdmin(false); return; }
    (async () => {
      try {
        const ok = await checkIsAdmin(uid);
        setIsAdmin(!!ok);
      } catch (err) {
        console.warn("admin check failed:", err);
        setIsAdmin(false);
      }
    })();
  }, [uid]);

  async function handleCancel(reservationId) {
    if (!reservationId) return;
    if (!confirm("Confirmar cancelamento desta reserva?")) return;
    try {
      await cancelReservationHelper(reservationId, uid);
      alert("Reserva cancelada com sucesso.");
    } catch (err) {
      console.error("Erro ao cancelar reserva:", err);
      if (err.code === "permission-denied") {
        alert("Sem permissão para cancelar. Verifica as regras do Firestore.");
      } else {
        alert("Erro ao cancelar reserva: " + (err.message || err));
      }
    }
  }

  const active = reservations.filter(r => r.status === "reserved");
  const history = reservations.filter(r => r.status !== "reserved");

  return (
    <div style={{ minWidth: 360 }}>
      <div className="mb-4 flex gap-3">
        <button onClick={() => setTab("profile")} className={`px-4 py-2 rounded ${tab === "profile" ? "bg-gray-100" : ""}`}>Perfil</button>
        <button onClick={() => setTab("active")} className={`px-4 py-2 rounded ${tab === "active" ? "bg-gray-100" : ""}`}>Reservas</button>
        <button onClick={() => setTab("history")} className={`px-4 py-2 rounded ${tab === "history" ? "bg-gray-100" : ""}`}>Histórico</button>
        {isAdmin && <button onClick={() => setTab("admin")} className={`px-4 py-2 rounded ${tab === "admin" ? "bg-gray-100" : ""}`}>Admin</button>}
      </div>

      {tab === "profile" && (
        <>
          <h4 className="font-semibold mb-2">Perfil</h4>
          {currentUser ? (
            <div className="text-sm">
              <div><strong>Nome:</strong> {currentUser.displayName || "(sem nome)"}</div>
              <div className="mt-2"><strong>Email:</strong> {currentUser.email}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { logout(); onClose && onClose(); }} className="px-3 py-1 border rounded">Terminar sessão</button>
                <button onClick={() => onClose && onClose()} className="px-3 py-1 border rounded">Fechar</button>
              </div>
            </div>
          ) : <div>Inicia sessão para ver o perfil.</div>}
        </>
      )}

      {tab === "active" && (
        <>
          <h4 className="font-semibold mb-2">Reservas activas</h4>
          {loading ? <div>Carregando...</div> : active.length === 0 ? <div>Sem reservas activas.</div> : (
            <div className="space-y-3">
              {active.map(r => (
                <div key={r.id} className="p-3 border rounded bg-white">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-gray-500">€{(r.price||0).toFixed(2)} — Pedido: {r.orderId || "-"}</div>
                  <div className="mt-2">
                    <button onClick={() => handleCancel(r.id)} className="px-3 py-1 border rounded">Cancelar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "history" && (
        <>
          <h4 className="font-semibold mb-2">Histórico de reservas</h4>
          {history.length === 0 ? <div>Sem histórico.</div> : (
            <div className="space-y-2">
              {history.map(r => (
                <div key={r.id} className="p-3 border rounded bg-white">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-gray-500">Estado: {r.status} — €{(r.price||0).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "admin" && isAdmin && (
        <>
          <h4 className="font-semibold mb-2">Admin (gestão de menus)</h4>
          <div className="text-sm">Aqui podes aceder ao painel de administração (editar menus, preços, etc.).</div>
          {/* Se quiseres posso adicionar CRUD de menus aqui — diz que eu adiciono. */}
        </>
      )}
    </div>
  );
}
