// src/components/topheader.jsx
import React from "react";

export default function TopHeader({ user, onOpenLogin, onOpenDrawer, onLogout }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold">🍽️ SmartCanteen</div>
          <nav className="hidden md:flex gap-3 text-sm text-gray-600">
            <button className="px-3 py-1" onClick={onOpenDrawer}>Reservas</button>
            <button className="px-3 py-1">Ementa da Semana</button>
            <button className="px-3 py-1">Contacto</button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="text-sm mr-2">Bem-vindo, <strong>{user.displayName || user.email}</strong></div>
              <button className="px-3 py-1 border rounded" onClick={onLogout}>Terminar sessão</button>
            </>
          ) : (
            <button className="px-3 py-1 border rounded" onClick={onOpenLogin}>Login / Registar</button>
          )}
        </div>
      </div>
    </header>
  );
}
