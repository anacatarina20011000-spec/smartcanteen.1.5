// src/components/slidingdrawer.jsx
import React from "react";

export default function SlidingDrawer({ open, onClose, children }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={onClose}
          />
          <aside
            className="relative w-80 max-w-full bg-white h-full shadow-xl p-4 overflow-auto transform transition-transform"
            style={{ animation: "slideIn 220ms ease" }}
          >
            <div className="flex items-center justify-between mb-4">
              <strong>Menu</strong>
              <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
                Fechar
              </button>
            </div>

            <div>{children}</div>
          </aside>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-12px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
