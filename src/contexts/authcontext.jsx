// src/contexts/authcontext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setInitializing(false);
    });
    return () => unsub();
  }, []);

  async function signup(email, password, displayName) {
    const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
    if (displayName) {
      // tenta atualizar o displayName
      try {
        await updateProfile(userCred.user, { displayName });
      } catch (e) { console.warn("updateProfile falhou:", e); }
    }
    return userCred;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email.trim(), password.trim());
  }

  async function logout() {
    return signOut(auth);
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email.trim());
  }

  const value = {
    currentUser,
    initializing,
    signup,
    login,
    logout,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
