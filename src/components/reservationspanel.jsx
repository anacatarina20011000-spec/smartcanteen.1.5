// src/components/ReservationsPanel.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/authcontext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { cancelReservation } from "../lib/reservations"; // import correcto, não declarar localmente com o mesmo nome

export default function ReservationsPanel() {
  const { currentUser } = useAuth();
  const [activeOnly, setActiveOnly] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setItems([]);
      return;
    }

    setLoading(true);
    const q = query(collection(db, "reservations"), where("uid", "==", currentUser.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(arr);
        setLoading(false);
      },
      (err) => {
        console.error("ReservationsPanel: onSnapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser]);

  const filtered = items.filter((r) => (activeOnly ? r.status === "reserved" : true));

  // não usar o nome "cancelReservation" aqui para evitar conflito com o import
  async function handleCancelReservation(id) {
    if (!id) return;
    if (!confirm("Tens a certeza que queres cancelar esta reserva?")) return;

    try {
      setCancelling(id);
      await cancelReservation(id); // usa o import
      alert("Reserva cancelada com sucesso.");
      // onSnapshot atualiza automaticamente
    } catch (err) {
      console.error("Erro a cancelar reserva:", err);
      alert("Erro ao cancelar: " + (err.message || err));
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Reservas</h4>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <button
            onClick={() => setActiveOnly(true)}
            className={`px-2 py-1 rounded ${activeOnly ? "bg-indigo-100" : "hover:bg-gray-100"}`}
          >
            Ativas
          </button>
          <button
            onClick={() => setActiveOnly(false)}
            className={`px-2 py-1 rounded ${!activeOnly ? "bg-indigo-100" : "hover:bg-gray-100"}`}
          >
            Todas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">A carregar reservas…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-500">Não tens reservas.</div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => (
            <li key={r.id} className="p-3 border rounded bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-sm">{r.title || r.itemId}</div>
                  <div className="text-xs text-gray-500">Estado: {r.status}</div>
                  <div className="text-xs text-gray-400">ID: {r.id}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm font-semibold">€{Number(r.price || 0).toFixed(2)}</div>
                  {r.status === "reserved" ? (
                    <button
                      onClick={() => handleCancelReservation(r.id)}
                      disabled={cancelling === r.id}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                    >
                      {cancelling === r.id ? "A cancelar..." : "Cancelar"}
                    </button>
                  ) : (
                    <div className="text-xs text-gray-400">Não reservável</div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// src/components/ReservationsPanel.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/authcontext";

export default function ReservationsPanel({ onCloseDrawer }) {
  const { currentUser } = useAuth();
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "reservations"),
      where("uid", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setReservas(arr);
    }, err => console.error("reservations onSnapshot", err));
    return () => unsub();
  }, [currentUser]);

  if (!currentUser) return <div>Inicia sessão para ver as tuas reservas.</div>;

  return (
    <div>
      {reservas.length === 0 ? (
        <div className="text-sm text-gray-500">Não tens reservas activas.</div>
      ) : (
        <ul className="space-y-2">
          {reservas.map(r => (
            <li key={r.id} className="p-2 border rounded bg-gray-50">
              <div className="font-medium">{r.title}</div>
              <div className="text-sm text-gray-600">Preço: €{(r.price||0).toFixed(2)} — Estado: {r.status || "reserved"}</div>
              <div className="text-xs text-gray-400">Pedido: {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : ""}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
