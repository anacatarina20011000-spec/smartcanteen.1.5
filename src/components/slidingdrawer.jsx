// src/components/slidingdrawer.jsx
import React from "react";

export default function SlidingDrawer({ open, onClose, children, width = 420 }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <aside style={{ width }} className="relative bg-white p-4 overflow-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Reservas & Perfil</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">Fechar</button>
        </div>
        <div>{children}</div>
      </aside>
    </div>
  );
}
