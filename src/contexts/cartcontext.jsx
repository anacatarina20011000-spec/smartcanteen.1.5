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
      return { ...state, items: action.payload || [] };
    case "ADD": {
      const exists = state.items.find(i => i.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id ? { ...i, qty: i.qty + (action.payload.qty || 1) } : i
          )
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, qty: action.payload.qty || 1 }] };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map(i => (i.id === action.payload.id ? { ...i, qty: action.payload.qty } : i))
      };
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

  // load from localStorage
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
      console.warn("CartProvider: localStorage read error", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("smartcanteen_cart_v1", JSON.stringify({ items: state.items }));
    } catch (e) {
      console.warn("CartProvider: localStorage write error", e);
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

  // checkout: create order, then reservations for each item (attached orderId)
  async function checkout() {
    if (!currentUser) throw new Error("Deve estar autenticado para comprar.");
    if (state.items.length === 0) throw new Error("Carrinho vazio.");

    const order = {
      userId: currentUser.uid,
      userEmail: currentUser.email || null,
      items: state.items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total: cartTotal(),
      status: "paid",
      createdAt: serverTimestamp(),
    };

    try {
      const ordersCol = collection(db, "orders");
      const docRef = await addDoc(ordersCol, order);
      const orderId = docRef.id;

      // create reservations using helper (passes orderId)
      const reservationPromises = state.items.map(i =>
        createReservation({ user: currentUser, item: { id: i.id, name: i.name, price: i.price }, orderId })
      );

      const reservationResults = await Promise.all(reservationPromises);
      const reservationIds = reservationResults.map(r => r.id);

      // don't clear cart here — let UI decide when to clear (we can clear later)
      return { orderId, reservationIds };
    } catch (err) {
      console.error("CartProvider: checkout error:", err);
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
