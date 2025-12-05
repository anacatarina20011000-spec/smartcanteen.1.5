// ProfilePanel.jsx
import React from "react";
import { useAuth } from "../contexts/authcontext";

export default function ProfilePanel() {
  const { currentUser } = useAuth();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
          {currentUser?.email?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <div className="font-semibold">{currentUser?.email || "Convidado"}</div>
          <div className="text-sm text-gray-500">Utilizador</div>
        </div>
      </div>
    </div>
  );
}
