// scripts/seedAdmins.js
// Contoh script untuk menambahkan admin ke firestore
// Jalankan dengan: node seedAdmins.js

import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";




const firebaseConfig = {
  apiKey: "AIzaSyAhwTibL9kP_YKnT4KXQN0SEwX9FiZgmFI",
  authDomain: "psaj-flutter.firebaseapp.com",
  projectId: "psaj-flutter",
  storageBucket: "psaj-flutter.appspot.com", // ✅ Perbaikan di sini
  messagingSenderId: "818316442422",
  appId: "1:818316442422:web:d0f263bea21aa7fc5d1197",
  measurementId: "G-E52D6SJVRJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin list untuk ditambahkan
const adminsToCreate = [
  {
    email: "admin1@gmail.com",
    password: "admin123", // pastikan menggunakan password yang kuat di produksi
    displayName: "Super Admin",
    role: "superadmin",
    isActive: true
  },
];

// Function untuk membuat admin
async function createAdmin(adminData) {
    try {
      // Coba buat user baru
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password
      );
      const user = userCredential.user;
  
      // Buat doc di Firestore
      await setDoc(doc(db, "admins", user.uid), {
        email: adminData.email,
        displayName: adminData.displayName,
        role: adminData.role,
        isActive: adminData.isActive,
        createdAt: serverTimestamp(),
        lastLogin: null
      });
  
      console.log(`✅ Admin created: ${adminData.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ Admin already exists in Auth: ${adminData.email}`);
        // Ambil user UID secara manual lewat Auth admin SDK (opsional), atau skip
      } else {
        console.error(`❌ Error creating admin ${adminData.email}:`, error);
      }
    }
  }
  

// Menjalankan create admin untuk semua admin
async function seedAdmins() {
  console.log("Starting admin seeding...");
  
  for (const admin of adminsToCreate) {
    await createAdmin(admin);
  }
  
  console.log("Admin seeding completed");
  process.exit(0);
}

// Run seeder
seedAdmins();