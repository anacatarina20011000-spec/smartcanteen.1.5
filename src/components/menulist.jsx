// src/components/menulist.jsx
import React from "react";
import MenuCard from "./menucard";

export default function MenuList({ menus }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {menus.map(menu => (
        <MenuCard key={menu.id || menu._id || menu.name} menu={menu} />
      ))}
    </div>
  );
}
