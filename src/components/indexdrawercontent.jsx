// src/components/indexdrawercontent.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/authcontext";
import { cancelReservation as cancelReservationHelper } from "../lib/reservations";

export default function IndexDrawerContent({ currentUser: propUser, onClose }) {
  const { currentUser } = useAuth();
  const user = propUser || currentUser;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) {
      setReservations([]);
      setLoading(false);
      return;
    }

    // query reservations for current user, ordered by createdAt desc
    const q = query(
      collection(db, "reservations"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = [];
        snapshot.forEach((d) => {
          docs.push({ id: d.id, ...d.data() });
        });
        setReservations(docs);
        setLoading(false);
      },
      (err) => {
        console.error("reservations onSnapshot", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  async function handleCancel(reservationId) {
    if (!reservationId) return;
    try {
      await cancelReservationHelper(reservationId, uid);
      // UI auto-updates via onSnapshot
    } catch (err) {
      console.error("cancel reservation failed", err);
      alert("Erro ao cancelar reserva: " + (err.message || err));
    }
  }

  return (
    <div style={{ minWidth: 320 }}>
      <h3 className="mb-3">Reservas</h3>

      {!uid ? (
        <div className="text-sm text-gray-500">Inicia sessão para ver as tuas reservas.</div>
      ) : loading ? (
        <div className="text-sm text-gray-500">A carregar...</div>
      ) : reservations.length === 0 ? (
        <div className="text-sm text-gray-500">Sem reservas.</div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <div key={r.id} className="p-2 border rounded bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-gray-500">€{(r.price || 0).toFixed(2)} — {r.orderId ? `Pedido ${r.orderId}` : "Sem pedido"}</div>
                  <div className="text-xs text-gray-400 mt-1">Estado: <strong>{r.status}</strong></div>
                </div>

                <div className="flex flex-col gap-2">
                  {r.status === "reserved" ? (
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="px-2 py-1 text-sm border rounded bg-white"
                    >
                      Cancelar
                    </button>
                  ) : (
                    <div className="text-xs text-gray-400">Cancelado</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <button className="px-3 py-1 border rounded mr-2" onClick={() => onClose && onClose()}>
          Fechar
        </button>
      </div>
    </div>
  );
}
