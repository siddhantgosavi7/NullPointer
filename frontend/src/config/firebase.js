import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAb1B6LqqTMMZnz-AY8f0ddSemWh8zZ2SE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "auth-8c5ed.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "auth-8c5ed",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "auth-8c5ed.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "418145065852",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:418145065852:web:d73d946f314b28275be2f9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-J4V0CPSZDQ"
};

const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics only if supported in the environment (avoids errors in some environments)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { analytics };
export default app;
