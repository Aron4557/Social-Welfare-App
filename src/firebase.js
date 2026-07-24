// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKcucKYNSUbuc_DZ3P4ivpV-k5BQYzmaI",
  authDomain: "jedsfeed.firebaseapp.com",
  projectId: "jedsfeed",
  storageBucket: "jedsfeed.firebasestorage.app",
  messagingSenderId: "58376840198",
  appId: "1:58376840198:web:38b4d5ce8a0cf756604f87",
  measurementId: "G-WHSPP3RWX7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;