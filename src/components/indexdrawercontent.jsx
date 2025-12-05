// src/components/indexdrawercontent.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/authcontext";
import { cancelReservation as cancelReservationHelper } from "../lib/reservations";

/**
 * IndexDrawerContent
 * - tabs: active | history | profile | admin
 * - admin tab aparece só se o doc /admin/{uid} existir (ou podes adaptar para email check)
 */
export default function IndexDrawerContent({ currentUser: propUser, onClose }) {
  const { currentUser } = useAuth();
  const user = propUser || currentUser;
  const uid = user?.uid;

  const [tab, setTab] = useState("active"); // active | history | profile | admin
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [selected, setSelected] = useState(null); // selected reservation for details modal
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin: menus list + form state
  const [menus, setMenus] = useState([]);
  const [menuForm, setMenuForm] = useState({ id: null, name: "", description: "", price: "" });
  const [menusLoading, setMenusLoading] = useState(false);

  // subscribe reservations of this user (all statuses) ordered by createdAt desc
  useEffect(() => {
    if (!uid) {
      setReservations([]);
      return;
    }
    setLoading(true);
    const q = query(collection(db, "reservations"), where("uid", "==", uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = [];
        snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
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

  // detecta admin: procura doc em collection "admin" com id = uid
  useEffect(() => {
    if (!uid) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const docRef = doc(db, "admin", uid);
        const snap = await getDocs(query(collection(db, "admin"))); // fallback: we will check presence differently
        // Better approach: try getDoc(docRef) but use modular import getDoc
      } catch (e) {
        // ignore - we'll try simpler: fetch doc directly using getDoc
      }
    })();

    // simpler reliable check using getDoc
    import("firebase/firestore").then(async (fs) => {
      const { getDoc } = fs;
      try {
        const docRef = doc(db, "admin", uid);
        const d = await getDoc(docRef);
        if (!cancelled) setIsAdmin(!!d.exists());
      } catch (err) {
        console.warn("admin check failed", err);
        if (!cancelled) setIsAdmin(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  // load menus for admin
  async function loadMenus() {
    setMenusLoading(true);
    try {
      const snap = await getDocs(collection(db, "menus"));
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setMenus(arr);
    } catch (err) {
      console.error("loadMenus err", err);
      alert("Erro ao carregar menus: " + (err.message || err));
    } finally {
      setMenusLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) loadMenus();
  }, [isAdmin]);

  // cancel reservation (calls helper)
  async function handleCancel(reservationId) {
    if (!reservationId) return;
    const ok = confirm("Confirmas que queres cancelar esta reserva?");
    if (!ok) return;
    try {
      await cancelReservationHelper(reservationId, uid);
      // onSnapshot actualiza automaticamente
    } catch (err) {
      console.error("cancel reservation failed", err);
      alert("Erro ao cancelar reserva: " + (err.message || err));
    }
  }

  // ADMIN menu operations (create/update/delete)
  async function adminSaveMenu() {
    if (!menuForm.name) return alert("Nome obrigatório");
    try {
      if (menuForm.id) {
        // update
        const ref = doc(db, "menus", menuForm.id);
        await updateDoc(ref, {
          name: menuForm.name,
          description: menuForm.description || "",
          price: Number(menuForm.price || 0),
        });
        alert("Menu actualizado");
      } else {
        await addDoc(collection(db, "menus"), {
          name: menuForm.name,
          description: menuForm.description || "",
          price: Number(menuForm.price || 0),
          createdAt: serverTimestamp(),
        });
        alert("Menu criado");
      }
      setMenuForm({ id: null, name: "", description: "", price: "" });
      loadMenus();
    } catch (err) {
      console.error("adminSaveMenu err", err);
      alert("Erro a gravar menu: " + (err.message || err));
    }
  }

  async function adminEditMenu(m) {
    setMenuForm({ id: m.id, name: m.name || "", description: m.description || "", price: String(m.price || "") });
  }

  async function adminDeleteMenu(id) {
    const ok = confirm("Eliminar menu? Esta acção é irreversível.");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "menus", id));
      loadMenus();
    } catch (err) {
      console.error("adminDeleteMenu err", err);
      alert("Erro ao eliminar menu: " + (err.message || err));
    }
  }

  // UI helpers
  const activeReservations = reservations.filter(r => r.status === "reserved");
  const historyReservations = reservations.filter(r => r.status !== "reserved");

  return (
    <div style={{ minWidth: 340 }}>
      {/* Tabs */}
      <div className="mb-4 flex gap-3">
        <button
          className={`px-4 py-2 rounded-lg text-sm ${tab === "active" ? "bg-gray-100 font-semibold" : "bg-transparent"}`}
          onClick={() => setTab("active")}
        >
          Reservas Ativas
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm ${tab === "history" ? "bg-gray-100 font-semibold" : "bg-transparent"}`}
          onClick={() => setTab("history")}
        >
          Histórico
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm ${tab === "profile" ? "bg-gray-100 font-semibold" : "bg-transparent"}`}
          onClick={() => setTab("profile")}
        >
          Perfil
        </button>

        {isAdmin && (
          <button
            className={`px-4 py-2 rounded-lg text-sm ${tab === "admin" ? "bg-gray-100 font-semibold" : "bg-transparent"}`}
            onClick={() => setTab("admin")}
          >
            Admin
          </button>
        )}
      </div>

      {/* Content */}
      {tab === "active" && (
        <>
          <h4 className="font-semibold mb-2">Reservas activas</h4>
          {loading ? <div className="text-sm text-gray-500">A carregar...</div> : (
            activeReservations.length === 0 ? (
              <div className="text-sm text-gray-500">Sem reservas activas.</div>
            ) : (
              <div className="space-y-3">
                {activeReservations.map(r => (
                  <div key={r.id} className="p-3 border rounded bg-white">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-gray-500">€{(r.price||0).toFixed(2)} — Pedido: {r.orderId || "-"}</div>
                    <div className="mt-2 flex gap-2">
                      <button className="px-3 py-1 border rounded text-sm" onClick={() => setSelected(r)}>Ver</button>
                      <button className="px-3 py-1 border rounded text-sm bg-white" onClick={() => handleCancel(r.id)}>Cancelar</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {tab === "history" && (
        <>
          <h4 className="font-semibold mb-2">Histórico</h4>
          {loading ? <div className="text-sm text-gray-500">A carregar...</div> : (
            historyReservations.length === 0 ? (
              <div className="text-sm text-gray-500">Ainda sem histórico.</div>
            ) : (
              <div className="space-y-3">
                {historyReservations.map(r => (
                  <div key={r.id} className="p-3 border rounded bg-white">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-gray-500">€{(r.price||0).toFixed(2)} — Estado: {r.status}</div>
                    <div className="mt-2 flex gap-2">
                      <button className="px-3 py-1 border rounded text-sm" onClick={() => setSelected(r)}>Ver</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {tab === "profile" && (
        <>
          <h4 className="font-semibold mb-2">Perfil</h4>
          {user ? (
            <div className="text-sm">
              <div><strong>Email:</strong> {user.email}</div>
              <div className="mt-2"><strong>UID:</strong> {user.uid}</div>
              <div className="mt-3">
                <button onClick={onClose} className="px-3 py-1 border rounded mr-2">Fechar</button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Inicia sessão para ver o perfil.</div>
          )}
        </>
      )}

      {tab === "admin" && isAdmin && (
        <>
          <h4 className="font-semibold mb-2">Admin — Gestão de Menus</h4>

          <div className="mb-3">
            <label className="block text-sm">Nome</label>
            <input className="w-full border rounded p-2 mb-2" value={menuForm.name} onChange={e => setMenuForm(s => ({ ...s, name: e.target.value }))} />
            <label className="block text-sm">Descrição</label>
            <input className="w-full border rounded p-2 mb-2" value={menuForm.description} onChange={e => setMenuForm(s => ({ ...s, description: e.target.value }))} />
            <label className="block text-sm">Preço</label>
            <input className="w-full border rounded p-2 mb-2" value={menuForm.price} onChange={e => setMenuForm(s => ({ ...s, price: e.target.value }))} />
            <div className="flex gap-2">
              <button onClick={adminSaveMenu} className="px-3 py-1 bg-blue-600 text-white rounded">{menuForm.id ? "Actualizar" : "Criar"}</button>
              <button onClick={() => setMenuForm({ id: null, name: "", description: "", price: "" })} className="px-3 py-1 border rounded">Limpar</button>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2">Menus existentes</h5>
            {menusLoading ? <div className="text-sm text-gray-500">A carregar...</div> : menus.length === 0 ? <div className="text-sm text-gray-500">Sem menus.</div> : (
              <div className="space-y-2">
                {menus.map(m => (
                  <div key={m.id} className="p-2 border rounded bg-white flex items-center justify-between">
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-gray-500">€{(m.price||0).toFixed(2)} — {m.description}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="px-2 py-1 border rounded" onClick={() => adminEditMenu(m)}>Editar</button>
                      <button className="px-2 py-1 border rounded" onClick={() => adminDeleteMenu(m.id)}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Details modal */}
      {selected && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg">
            <h3 className="text-xl font-bold mb-2">{selected.title}</h3>
            <div className="text-sm text-gray-600 mb-2">€{(selected.price||0).toFixed(2)}</div>
            <div className="text-sm text-gray-500 mb-4">Pedido: {selected.orderId || "-"}</div>
            <div className="text-sm text-gray-400 mb-4">Estado: {selected.status}</div>
            <div className="flex gap-3 justify-center">
              {selected.status === "reserved" && <button onClick={() => handleCancel(selected.id)} className="px-4 py-2 border rounded">Cancelar Reserva</button>}
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-blue-600 text-white rounded">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
