// lib/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_tdo8dVVpSYSGpx2lo4cfBOGQR6Ok2ns",
  authDomain: "camseltry.firebaseapp.com",
  projectId: "camseltry",
  storageBucket: "camseltry.appspot.com",
  messagingSenderId: "855349177144",
  appId: "1:855349177144:web:403cfa7bd3e0bd151eefcd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services for use throughout your app
export const auth = getAuth(app); // For Authentication
export const db = getFirestore(app); // For Firestore Database
export const storage = getStorage(app); // For Storage
