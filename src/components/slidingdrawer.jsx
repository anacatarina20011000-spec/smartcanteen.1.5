// src/components/slidingdrawer.jsx
import React from "react";

export default function SlidingDrawer({ open, onClose, children, width = 420 }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="relative bg-white h-full shadow-xl overflow-auto"
        style={{
          width: `${width}px`,
          maxWidth: "100%",
          transform: "translateX(0)",
          transition: "transform 220ms ease",
        }}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="text-lg font-semibold">Menu</div>
          <button onClick={onClose} className="px-3 py-1 rounded hover:bg-gray-100">
            Fechar
          </button>
        </div>

        <div className="p-4">{children}</div>
      </aside>
    </div>
  );
}
