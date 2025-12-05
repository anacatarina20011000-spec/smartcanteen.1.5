// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/authcontext";
import { CartProvider } from "./contexts/cartcontext";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) console.error("Root element not found. Verifica index.html");
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
