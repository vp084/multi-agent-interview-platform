import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "freshersai-5b074.firebaseapp.com",
  projectId: "freshersai-5b074",
  storageBucket: "freshersai-5b074.firebasestorage.app",
  messagingSenderId: "10856669251275",
  appId: "1:10856669251275:web:410d86f802d3a56760634e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };