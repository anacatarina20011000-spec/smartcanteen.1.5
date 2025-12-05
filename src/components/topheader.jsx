// src/components/topheader.jsx
import React from "react";
import { useAuth } from "../contexts/authcontext";

export default function TopHeader({ onToggleDrawer, onOpenLogin }) {
  const { currentUser, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      // opcional: feedback
      console.debug("Logout successful");
    } catch (err) {
      console.error("Logout error", err);
      alert("Erro ao terminar sessão: " + (err.message || err));
    }
  }

  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onToggleDrawer} className="p-2 rounded-md hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="text-lg font-bold">SmartCanteen</div>
        </div>

        <nav className="flex items-center gap-4">
          <button onClick={onToggleDrawer} className="text-sm px-3 py-1 rounded hover:bg-gray-100">Reservas</button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700">Bem-vindo <button className="underline" onClick={handleLogout}>{currentUser.email}</button></div>
              <button onClick={handleLogout} className="px-3 py-1 border rounded text-sm">Terminar sessão</button>
            </div>
          ) : (
            <button onClick={onOpenLogin} className="px-3 py-1 border rounded text-sm">Login / Conta</button>
          )}
        </nav>
      </div>
    </header>
  );
}
