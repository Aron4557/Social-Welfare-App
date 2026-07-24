// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAr_D76zuuKjq5FZpLrVUBYl6F_1Oht2CQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "social-welfare-app-9f22a.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://social-welfare-app-9f22a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "social-welfare-app-9f22a",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "social-welfare-app-9f22a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "294343031258",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:294343031258:web:a418a2e1f25754ae70a8e3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-60WBHXHNNE",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export let analytics = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

export default app;
