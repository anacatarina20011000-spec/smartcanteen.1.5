// src/components/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/authcontext";

export default function AdminPanel() {
  const { currentUser, isAdmin } = useAuth();
  const [menus, setMenus] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({ id: null, name: "", description: "", price: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    const menusCol = collection(db, "menus");
    const q = query(menusCol, orderBy("name"));
    const unsubMenus = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setMenus(arr);
    }, (err) => console.error("menus onSnapshot error", err));

    const resCol = collection(db, "reservations");
    const q2 = query(resCol, orderBy("createdAt", "desc"));
    const unsubRes = onSnapshot(q2, (snap) => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setReservations(arr);
    }, (err) => console.error("reservations onSnapshot error", err));

    return () => { unsubMenus(); unsubRes(); };
  }, [isAdmin]);

  if (!currentUser) return <div>Deve iniciar sessão.</div>;
  if (!isAdmin) return <div>Não tem permissão para aceder ao Painel de Administração.</div>;

  async function handleCreateOrUpdate(e) {
    e.preventDefault();
    setError("");
    const name = (form.name || "").trim();
    const description = (form.description || "").trim();
    const price = Number(String(form.price || "0").replace(",", "."));
    if (!name) return setError("Nome obrigatório.");
    if (!Number.isFinite(price)) return setError("Preço inválido.");

    try {
      if (form.id) {
        await updateDoc(doc(db, "menus", form.id), { name, description, price });
      } else {
        await addDoc(collection(db, "menus"), { name, description, price });
      }
      setForm({ id: null, name: "", description: "", price: "" });
    } catch (err) {
      console.error("AdminPanel save error", err);
      setError(err.message || "Erro ao gravar.");
    }
  }

  async function handleEdit(menu) {
    setForm({ id: menu.id, name: menu.name || "", description: menu.description || "", price: menu.price ?? "" });
  }

  async function handleDelete(menuId) {
    if (!confirm("Eliminar menu?")) return;
    try { await deleteDoc(doc(db, "menus", menuId)); } catch (err) { console.error(err); alert("Erro ao apagar"); }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Painel Admin</h2>

      <section className="mb-6 p-4 bg-white rounded shadow">
        <h3 className="font-semibold mb-2">Criar / Editar Menu</h3>
        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          <div>
            <label className="block text-sm">Nome</label>
            <input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Descrição</label>
            <input value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm">Preço (€)</label>
            <input value={form.price} onChange={e => setForm(s => ({ ...s, price: e.target.value }))} className="w-40 p-2 border rounded" />
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{form.id ? "Actualizar" : "Criar"}</button>
            <button type="button" onClick={() => setForm({ id: null, name: "", description: "", price: "" })} className="px-3 py-2 border rounded">Limpar</button>
          </div>
        </form>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Menus existentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {menus.map(m => (
            <div key={m.id} className="p-3 bg-white rounded shadow flex justify-between items-start">
              <div>
                <div className="font-semibold">{m.name}</div>
                <div className="text-sm text-gray-600">{m.description}</div>
                <div className="mt-2 font-bold">€{(m.price ?? 0).toFixed(2)}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleEdit(m)} className="px-2 py-1 bg-blue-600 text-white rounded">Editar</button>
                <button onClick={() => handleDelete(m.id)} className="px-2 py-1 border rounded">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-2">Reservas (todas)</h3>
        <div className="space-y-2">
          {reservations.map(r => (
            <div key={r.id} className="p-3 bg-white rounded shadow flex items-start justify-between">
              <div>
                <div className="font-medium">{r.title} — €{(r.price||0).toFixed(2)}</div>
                <div className="text-sm text-gray-500">User: {r.userEmail || r.uid}</div>
                <div className="text-xs text-gray-400">Status: {r.status || "reserved"}</div>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => updateDoc(doc(db, "reservations", r.id), { status: "served" })} className="px-2 py-1 bg-green-600 text-white rounded">Marcar como servido</button>
                <button onClick={() => updateDoc(doc(db, "reservations", r.id), { status: "cancelled" })} className="px-2 py-1 border rounded">Cancelar</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
