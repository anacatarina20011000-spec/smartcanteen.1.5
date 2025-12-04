import React from "react";

export default function MenuCard({ item, onAdd }) {
  return (
    <div className={`p-4 rounded-lg bg-white soft-shadow ${item.vegan ? "border-2 border-green-300" : "border border-gray-200"}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-base">{item.title}</h3>
          <p className="text-xs text-gray-500 mt-2">{item.desc}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">{item.price} €</div>
          {item.vegan && <div className="text-sm text-green-600 mt-1">Vegan</div>}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          className="btn-secondary"
          onClick={() => onAdd(item)}
        >
          + Pedir
        </button>
        <span className="text-sm text-gray-400"> </span>
      </div>
    </div>
  );
}
