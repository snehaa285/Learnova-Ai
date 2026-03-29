import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // <-- This was missing!

const firebaseConfig = {
  apiKey: "AIzaSyDdePsV4pXC_kClboJglxols4Z6QXNS4nk",
  authDomain: "learnova-ai-fdcf5.firebaseapp.com",
  projectId: "learnova-ai-fdcf5",
  storageBucket: "learnova-ai-fdcf5.firebasestorage.app",
  messagingSenderId: "74416460249",
  appId: "1:74416460249:web:15bc0a7c79ce65d010c9c8",
  measurementId: "G-1Q3TJ6F7FP"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 👇 THESE ARE THE EXPORTS YOUR APP NEEDS TO RUN 👇
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();