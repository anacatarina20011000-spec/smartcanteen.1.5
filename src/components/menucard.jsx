// src/components/menucard.jsx
import React from "react";
import { useCart } from "../contexts/cartcontext";

export default function MenuCard({ menu }) {
  const { addToCart } = useCart();
  const id = menu.id ?? menu._id ?? `${menu.name || "menu"}-${Math.random()}`;
  const name = menu.name ?? menu.title ?? "Sem nome";
  const priceNum = Number(menu.price || 0);
  const price = Number.isFinite(priceNum) ? priceNum : 0;

  return (
    <div className="card-outline p-4 bg-white soft-shadow rounded-lg">
      <h4 className="font-semibold mb-2">{name}</h4>
      {menu.description && <p className="text-sm text-gray-600 mb-3">{menu.description}</p>}
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold">€{price.toFixed(2)}</span>
        <button
          className="btn-secondary px-3 py-1 rounded"
          onClick={() => addToCart({ id, name, price })}
        >
          + Pedir
        </button>
      </div>
    </div>
  );
}
