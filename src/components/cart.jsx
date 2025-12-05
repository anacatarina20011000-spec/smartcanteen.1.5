// src/components/cart.jsx
import React, { useState } from "react";
import { useCart } from "../contexts/cartcontext";

export default function Cart() {
  const { items, removeFromCart, updateQty, cartTotal, checkout, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);

  async function handleCheckout() {
    setLoading(true);
    setMessage("");
    try {
      const { orderId } = await checkout();
      setLastOrderId(orderId);
      setSuccessOpen(true);
    } catch (err) {
      console.error("checkout error", err);
      setMessage(err.message || "Erro no pagamento.");
    } finally {
      setLoading(false);
    }
  }

  function closeSuccess() {
    // limpa carrinho quando fecha confirmação
    try { clearCart(); } catch (e) {}
    setSuccessOpen(false);
    setLastOrderId(null);
  }

  if (!items || items.length === 0) {
    return <div className="p-4 border rounded bg-white">O carrinho está vazio.</div>;
  }

  return (
    <>
      <div className="p-4 border rounded bg-white">
        <h3 className="text-lg font-semibold mb-2">Carrinho</h3>
        {items.map(it => (
          <div key={it.id} className="flex items-center justify-between gap-2 mb-3">
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-sm">€{(Number(it.price) || 0).toFixed(2)}</div>
            </div>

            <div className="flex items-center gap-2">
              <input type="number" min="1" value={it.qty} onChange={(e) => updateQty(it.id, Math.max(1, Number(e.target.value || 1)))} className="w-16 p-1 border rounded" />
              <div className="w-24 text-right">€{((Number(it.price) || 0) * it.qty).toFixed(2)}</div>
              <button onClick={() => removeFromCart(it.id)} className="px-2 py-1 border rounded">Remover</button>
            </div>
          </div>
        ))}

        <div className="mt-4 flex items-center justify-between">
          <div className="font-bold">Total: €{cartTotal().toFixed(2)}</div>
          <button onClick={handleCheckout} disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-green-600"}`}>
            {loading ? "A processar..." : "Finalizar compra"}
          </button>
        </div>

        {message && <div className="mt-3 text-center text-sm text-red-600">{message}</div>}
      </div>

      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" />
          <div className="relative bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg">
            <h3 className="text-xl font-bold mb-2 text-center">Menu comprado com sucesso!</h3>
            {lastOrderId && <div className="text-sm text-center text-gray-600 mb-4">Pedido #{lastOrderId}</div>}
            <div className="flex justify-center">
              <button onClick={closeSuccess} className="px-4 py-2 bg-blue-600 text-white rounded">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
