// src/components/logincard.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/authcontext";

export default function LoginCard({ onSwitch }) {
  const { login, signup, logout, currentUser, resetPassword } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      setEmail("");
      setPassword("");
      if (onSwitch) onSwitch();
    } catch (err) {
      console.error("Auth error:", err);
      const code = err.code || "";
      if (code === "auth/user-not-found") setError("Utilizador não encontrado.");
      else if (code === "auth/wrong-password") setError("Password incorreta.");
      else if (code === "auth/email-already-in-use") setError("Email já em uso.");
      else setError(err.message || "Ocorreu um erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!email) return setError("Indica o email para reset.");
    try {
      await resetPassword(email);
      alert("Email de reset enviado.");
    } catch (err) {
      console.error("reset error", err);
      setError(err.message || "Erro no reset.");
    }
  }

  if (currentUser) {
    return (
      <div className="card-outline p-6 bg-white soft-shadow max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-2">Sessão Iniciada</h2>
        <p className="mb-4">Logged in as <strong>{currentUser.email}</strong></p>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={async () => { try { await logout(); if (onSwitch) onSwitch(); } catch (e) { console.error(e); } }}>
            Logout
          </button>
          {onSwitch && (
            <button className="px-4 py-2 border rounded" onClick={() => onSwitch()}>
              Fechar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card-outline p-6 bg-white soft-shadow max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">{mode === "login" ? "Entrar" : "Criar conta"}</h2>

      <form onSubmit={handleSubmit}>
        <label className="block text-sm mb-1">Email</label>
        <input type="email" className="w-full border rounded p-2 mb-3" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="block text-sm mb-1">Password</label>
        <div className="flex gap-2 mb-3">
          <input type={showPassword ? "text" : "password"} className="flex-1 border rounded p-2" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <button type="button" className="px-3 py-1 border rounded" onClick={() => setShowPassword(s => !s)}>{showPassword ? "Esconder" : "Mostrar"}</button>
        </div>

        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

        <button type="submit" className="btn-primary w-full py-2" disabled={loading}>
          {mode === "login" ? (loading ? "Entrando..." : "Entrar") : (loading ? "A criar..." : "Criar conta")}
        </button>

        <p className="text-center mt-3 text-sm">
          {mode === "login" ? (
            <>
              Ainda não tem conta?{" "}
              <button type="button" className="text-[var(--accent)]" onClick={() => setMode("register")}>Criar conta</button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button type="button" className="text-[var(--accent)]" onClick={() => setMode("login")}>Entrar</button>
            </>
          )}
        </p>

        <p className="text-center mt-2">
          <button type="button" className="text-sm text-gray-500" onClick={handleReset}>Reset password</button>
        </p>

        {onSwitch && (
          <p className="text-center mt-2">
            <button type="button" className="text-sm text-gray-500" onClick={() => onSwitch()}>Voltar</button>
          </p>
        )}
      </form>
    </div>
  );
}
