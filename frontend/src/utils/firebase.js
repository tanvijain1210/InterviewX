// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey : import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewx-4c356.firebaseapp.com",
  projectId: "interviewx-4c356",
  storageBucket: "interviewx-4c356.firebasestorage.app",
  messagingSenderId: "570180296702",
  appId: "1:570180296702:web:425c55f35ad8c74aadaaaf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth=getAuth(app);
const provider= new GoogleAuthProvider()

export {auth, provider}