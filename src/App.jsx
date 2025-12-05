// src/App.jsx
import React, { useState } from "react";
import TopHeader from "./components/topheader";
import HeroCarousel from "./components/herocarousel";
import SlidingDrawer from "./components/slidingdrawer";
import IndexDrawerContent from "./components/indexdrawercontent";
import MenuList from "./components/menulist";
import Cart from "./components/cart";
import LoginCard from "./components/logincard";
import { menus as staticMenus } from "./data/menus";
import { useAuth } from "./contexts/authcontext";

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader
        user={currentUser}
        onOpenLogin={() => setShowLogin(true)}
        onOpenDrawer={() => setOpenDrawer(true)}
        onLogout={() => logout()}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <HeroCarousel />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Menus</h2>
              <div className="text-sm text-gray-500">Bem-vindo {currentUser?.email ?? "convidado"}</div>
            </div>

            <MenuList menus={staticMenus} />
          </section>

          <aside className="lg:col-span-1">
            <Cart />
          </aside>
        </div>
      </main>

      <SlidingDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} width={520}>
        <IndexDrawerContent onClose={() => setOpenDrawer(false)} />
      </SlidingDrawer>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowLogin(false)} />
          <div className="relative z-60">
            <LoginCard onSwitch={() => setShowLogin(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
