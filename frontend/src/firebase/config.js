// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCoxyHMncsFOKLopuClupe18oWthy7A0qY",
  authDomain: "next-nrgie.firebaseapp.com",
  projectId: "next-nrgie",
  storageBucket: "next-nrgie.firebasestorage.app",
  messagingSenderId: "803013817667",
  appId: "1:803013817667:web:813f869155852c5bc06bf6",
  measurementId: "G-HDR7CP94KT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
