// MenuGridEnhanced.jsx
import React from "react";
import MenuCard from "./menucard"; // usa o teu menucard existente ou a versão atualizada

export default function MenuGridEnhanced({ menus }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
      {menus.map(m => (
        <MenuCard key={m.id || m._id || m.name} menu={m} />
      ))}
    </div>
  );
}
