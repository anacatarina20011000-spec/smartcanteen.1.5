// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyABg5PJT9PWQsOEc5goTTMJbkv5GncWMZ8",
  authDomain: "smartcanteen-52949.firebaseapp.com",
  projectId: "smartcanteen-52949",
  storageBucket: "smartcanteen-52949.appspot.com",
  messagingSenderId: "814498368412",
  appId: "1:814498368412:web:e84564a0c4258606f19659",
  measurementId: "G-7MPS4KHC1E"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

let analytics = null;
try {
  analytics = getAnalytics(app);
} catch {
  // analytics may fail in some environments (ignore)
}
export { analytics };

console.log("Firebase carregado — Project ID:", firebaseConfig.projectId);
export default app;
