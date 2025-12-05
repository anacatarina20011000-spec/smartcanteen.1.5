// src/components/menucard.jsx
import React from "react";
import { useCart } from "../contexts/cartcontext";

export default function MenuCard(props) {
  const { addToCart } = useCart();
  const menu = props.menu || props.item || {};
  const id = menu.id ?? menu._id ?? `${menu.name || "menu"}-${Math.random()}`;
  const name = menu.name ?? menu.title ?? "Sem nome";
  const description = menu.description ?? menu.desc ?? "";
  const priceNum = Number(menu.price);
  const price = Number.isFinite(priceNum) ? priceNum : 0;

  return (
    <div className="card-outline p-4 bg-white soft-shadow rounded-lg">
      <h4 className="font-semibold mb-2">{name}</h4>
      {description && <p className="text-sm text-gray-600 mb-3">{description}</p>}
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold">€{price.toFixed(2)}</span>
        <button
          className="btn-secondary px-3 py-1 rounded"
          onClick={() => {
            console.log("MenuCard add click:", { id, name, price });
            addToCart({ id, name, price });
          }}
        >
          + Pedir
        </button>
      </div>
    </div>
  );
}
