import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1TBO_7bSbZMONpMuK8EOlUewUqrATO6g",
  authDomain: "dang-ky-hop.firebaseapp.com",
  projectId: "dang-ky-hop",
  storageBucket: "dang-ky-hop.firebasestorage.app",
  messagingSenderId: "546943557350",
  appId: "1:546943557350:web:1cacace9758f8f985d6527"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
