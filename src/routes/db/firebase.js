import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAhwTibL9kP_YKnT4KXQN0SEwX9FiZgmFI",
  authDomain: "psaj-flutter.firebaseapp.com",
  projectId: "psaj-flutter",
  storageBucket: "psaj-flutter.appspot.com", // ✅ Perbaikan di sini
  messagingSenderId: "818316442422",
  appId: "1:818316442422:web:d0f263bea21aa7fc5d1197",
  measurementId: "G-E52D6SJVRJ",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Firebase Analytics (jika di browser)
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Inisialisasi Firestore Database
const db = getFirestore(app);

// Inisialisasi Authentication
const auth = getAuth(app);

export { app, analytics, db, auth };
