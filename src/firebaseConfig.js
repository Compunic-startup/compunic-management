import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgNl5trTwEVFjHwsxTQkpoP1VjNVap0bs",
  authDomain: "leave-management-system-666a4.firebaseapp.com",
  databaseURL: "https://leave-management-system-666a4-default-rtdb.firebaseio.com",
  projectId: "leave-management-system-666a4",
  storageBucket: "leave-management-system-666a4.appspot.com",
  messagingSenderId: "646712416243",
  appId: "1:646712416243:web:ae486f3bceb0a77c102486",
  measurementId: "G-YZ15TLCTQF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);