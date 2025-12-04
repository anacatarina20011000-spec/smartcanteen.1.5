import React from "react";

export default function LoginCard({ onSwitch }) {
  return (
    <div className="max-w-md mx-auto">
      <div className="card-outline p-8 bg-white soft-shadow">
        <h2 className="text-3xl font-bold text-center text-[var(--accent)] mb-6">
          <span className="mr-2">↪</span> Entrar
        </h2>

        <label className="block text-sm mb-1">Email</label>
        <input className="w-full border rounded-lg p-3 mb-4" placeholder="o-seu-email@exemplo.com" />

        <label className="block text-sm mb-1">Palavra-passe</label>
        <input className="w-full border rounded-lg p-3 mb-6" type="password" placeholder="Mínimo 6 caracteres" />

        <button className="btn-primary w-full py-3 mb-4">↪ Login</button>

        <p className="text-center text-sm text-gray-600">
          Não tem conta? <button className="text-[var(--accent)] font-semibold" onClick={onSwitch}>Crie uma conta</button>
        </p>
      </div>
    </div>
  );
}
