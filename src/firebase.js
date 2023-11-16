import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8f71CffhQetg8gcNIyPskvZQyWyvUmRE",
  authDomain: "notebookv2-51750.firebaseapp.com",
  projectId: "notebookv2-51750",
  storageBucket: "notebookv2-51750.appspot.com",
  messagingSenderId: "537976584403",
  appId: "1:537976584403:web:11774bc713570c996bfc26",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
