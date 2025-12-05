// src/App.jsx
import React, { useState, useEffect } from "react";
import TopHeader from "./components/topheader";
import HeroCarousel from "./components/herocarousel";
import MenuList from "./components/menulist";
import Cart from "./components/cart";
import LoginCard from "./components/logincard";
import SlidingDrawer from "./components/slidingdrawer";
import IndexDrawerContent from "./components/indexdrawercontent";
import { menus as staticMenus } from "./data/menus";
import { useAuth } from "./contexts/authcontext";

export default function App() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { currentUser } = useAuth() || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader
        onToggleDrawer={() => setOpenDrawer(true)}
        onOpenLogin={() => setShowLogin(true)}
        userEmail={currentUser?.email}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <HeroCarousel />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Menus</h2>
            <MenuList menus={staticMenus} />
          </section>

          <aside className="lg:col-span-1">
            <Cart />
          </aside>
        </div>
      </main>

      <SlidingDrawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <IndexDrawerContent currentUser={currentUser} onClose={() => setOpenDrawer(false)} />
      </SlidingDrawer>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowLogin(false)} />
          <div className="relative z-10">
            <LoginCard onSwitch={() => setShowLogin(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
