// src/components/logincard.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/authcontext";

export default function LoginCard({ onSwitch }) {
  const { login, signup, logout, currentUser, resetPassword } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    // trim inputs
    const em = (email || "").trim();
    const pw = (password || "").trim();

    if (!em) {
      setError("Por favor insere um email válido.");
      setLoading(false);
      return;
    }
    if (pw.length < 6) {
      setError("Password deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        console.debug("Attempt login:", { email: em });
        await login(em, pw);
        console.debug("Login successful for", em);
      } else {
        console.debug("Attempt signup:", { email: em });
        await signup(em, pw);
        console.debug("Signup successful for", em);
      }

      // limpa formulário mas mantém modal aberto (sessão iniciada mostrará estado)
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Auth error:", err);
      const code = err?.code || "";
      if (code === "auth/user-not-found") setError("Utilizador não encontrado.");
      else if (code === "auth/wrong-password") setError("Password incorreta.");
      else if (code === "auth/email-already-in-use") setError("Email já em uso.");
      else if (code === "auth/invalid-email") setError("Email inválido.");
      else setError(err?.message || "Ocorreu um erro. Verifica o console.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setError("");
    setInfo("");
    const em = (email || "").trim();
    if (!em) {
      setError("Escreve o teu email acima para receber o link de redefinição.");
      return;
    }
    try {
      setLoading(true);
      await resetPassword(em);
      setInfo("Email de redefinição enviado. Verifica a tua caixa de entrada.");
      console.debug("Password reset requested for", em);
    } catch (err) {
      console.error("Reset password error:", err);
      const code = err?.code || "";
      if (code === "auth/user-not-found") setError("Utilizador não encontrado.");
      else setError(err?.message || "Erro ao enviar email de redefinição.");
    } finally {
      setLoading(false);
    }
  }

  if (currentUser) {
    return (
      <div className="card-outline p-6 bg-white soft-shadow max-w-md mx-auto z-50">
        <h2 className="text-xl font-semibold mb-2">Sessão Iniciada</h2>
        <p className="mb-4">Logged in as <strong>{currentUser.email}</strong></p>
        <div className="flex gap-2">
          <button
            className="btn-primary flex-1"
            onClick={async () => {
              try {
                await logout();
              } catch (err) {
                console.error("Logout error:", err);
                setError("Erro ao fazer logout. Verifica o console.");
              }
            }}
          >
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
    <div className="card-outline p-6 bg-white soft-shadow max-w-md mx-auto z-50">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {mode === "login" ? "Entrar" : "Criar conta"}
      </h2>

      <form onSubmit={handleSubmit}>
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          className="w-full border rounded p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block text-sm mb-1">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full border rounded p-2 mb-3 pr-20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 px-2 py-1 rounded"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        {info && <div className="text-green-600 text-sm mb-2">{info}</div>}

        <button type="submit" className="btn-primary w-full py-2" disabled={loading}>
          {mode === "login" ? (loading ? "Entrando..." : "Entrar") : (loading ? "A criar..." : "Criar conta")}
        </button>

        <div className="mt-3 text-center text-sm">
          {mode === "login" ? (
            <>
              Ainda não tem conta?{" "}
              <button type="button" className="text-[var(--accent)]" onClick={() => setMode("register")}>
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button type="button" className="text-[var(--accent)]" onClick={() => setMode("login")}>
                Entrar
              </button>
            </>
          )}
        </div>

        <div className="mt-3 flex justify-between items-center text-sm">
          <button
            type="button"
            onClick={handleResetPassword}
            className="text-gray-600 underline"
            disabled={loading}
          >
            Esqueci password
          </button>

          {onSwitch && (
            <button type="button" className="text-sm text-gray-500" onClick={() => onSwitch()}>
              Voltar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
