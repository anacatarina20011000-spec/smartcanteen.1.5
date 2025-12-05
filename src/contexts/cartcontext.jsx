// src/contexts/cartcontext.jsx
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./authcontext";
import { createReservation } from "../lib/reservations";

const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case "INIT":
      return { items: action.payload || [] };
    case "ADD": {
      const exists = state.items.find(i => i.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id ? { ...i, qty: (i.qty || 1) + (action.payload.qty || 1) } : i
          )
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, qty: action.payload.qty || 1 }] };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case "UPDATE_QTY":
      return { ...state, items: state.items.map(i => (i.id === action.payload.id ? { ...i, qty: action.payload.qty } : i)) };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const { currentUser } = useAuth();

  // carregar do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("smartcanteen_cart_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) {
          dispatch({ type: "INIT", payload: parsed.items });
        }
      }
    } catch (e) {
      console.warn("CartProvider: read localStorage error", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("smartcanteen_cart_v1", JSON.stringify({ items: state.items }));
    } catch (e) {
      console.warn("CartProvider: write localStorage error", e);
    }
  }, [state.items]);

  function addToCart(item, qty = 1) {
    dispatch({ type: "ADD", payload: { ...item, qty } });
  }

  function removeFromCart(id) {
    dispatch({ type: "REMOVE", payload: id });
  }

  function updateQty(id, qty) {
    dispatch({ type: "UPDATE_QTY", payload: { id, qty } });
  }

  function clearCart() {
    dispatch({ type: "CLEAR" });
  }

  function cartTotal() {
    return state.items.reduce((s, it) => s + (Number(it.price || 0) * (it.qty || 1)), 0);
  }

  /**
   * checkout():
   * - valida user
   * - cria orders doc
   * - cria reservations (one per item) usando createReservation (helper)
   * - NÃO limpa o carrinho aqui (caller faz isso depois)
   */
  async function checkout() {
    if (!currentUser || !currentUser.uid) throw new Error("Deve estar autenticado para comprar.");
    if (!state.items || state.items.length === 0) throw new Error("Carrinho vazio.");

    const orderPayload = {
      userId: currentUser.uid,
      userEmail: currentUser.email || null,
      items: state.items.map(i => ({ id: i.id, name: i.name, price: Number(i.price || 0), qty: i.qty })),
      total: cartTotal(),
      status: "paid",
      createdAt: serverTimestamp(),
    };

    try {
      const ordersCol = collection(db, "orders");
      const orderRef = await addDoc(ordersCol, orderPayload);
      const orderId = orderRef.id;

      // cria reservas e passa orderId
      const createdReservations = [];
      for (const it of state.items) {
        try {
          const res = await createReservation({ user: currentUser, item: { id: it.id, name: it.name, price: it.price }, orderId });
          createdReservations.push(res.id);
        } catch (err) {
          console.warn("createReservation failed for item", it, err);
        }
      }

      return { orderId, reservationIds: createdReservations };
    } catch (err) {
      console.error("CartProvider: checkout error", err);
      throw err;
    }
  }

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    cartTotal,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
