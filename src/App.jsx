import React, { useState } from "react";
import { menus } from "./data/menus";
import MenuCard from "./components/menucard";
import LoginCard from "./components/logincard";

export default function App() {
  const [cart, setCart] = useState([]);
  const [showLogin, setShowLogin] = useState(false);

  function handleAdd(item) {
    setCart((c) => [...c, item]);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between px-4 py-3 bg-transparent mb-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">🍽️ <span className="ml-1">SmarCanteen</span></div>
          <div className="text-sm text-gray-500">Ementa da Semana</div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3 py-1 border rounded-md">Olá, Convidado</button>
          <button className="px-3 py-1 bg-[var(--accent)] text-white rounded-md" onClick={() => setShowLogin(true)}>Entrar</button>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6">
        {/* Left: cards */}
        <section className="col-span-8">
          <div className="grid grid-cols-2 gap-6">
            {menus.map((m) => (
              <MenuCard key={m.id} item={m} onAdd={handleAdd} />
            ))}
          </div>
        </section>

        {/* Right: order / login */}
        <aside className="col-span-4">
          {!showLogin ? (
            <div className="card-outline p-4 bg-white soft-shadow">
              <h3 className="font-semibold mb-3">O Seu Pedido</h3>
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <div className="inline-flex items-center justify-center w-32 h-24 border rounded-md mx-auto">
                    <div className="text-gray-300">Cesto vazio</div>
                  </div>
                </div>
              ) : (
                <ul>
                  {cart.map((c, idx) => (
                    <li key={idx} className="flex justify-between py-2 border-b last:border-b-0">
                      <span>{c.title}</span>
                      <span className="font-semibold">{c.price}€</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <LoginCard onSwitch={() => setShowLogin(false)} />
          )}
        </aside>
      </main>
    </div>
  );
}
