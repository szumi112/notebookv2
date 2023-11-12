import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlq-iJET1ONCoNt1WYvVI6Qfdh4H8K6a0",
  authDomain: "note-aa977.firebaseapp.com",
  projectId: "note-aa977",
  storageBucket: "note-aa977.appspot.com",
  messagingSenderId: "965139669682",
  appId: "1:965139669682:web:93cf32047fc686dc089fab",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const db = getFirestore(app);
