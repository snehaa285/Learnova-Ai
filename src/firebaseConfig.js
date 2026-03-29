// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdePsV4pXC_kClboJglxols4Z6QXNS4nk",
  authDomain: "learnova-ai-fdcf5.firebaseapp.com",
  projectId: "learnova-ai-fdcf5",
  storageBucket: "learnova-ai-fdcf5.firebasestorage.app",
  messagingSenderId: "74416460249",
  appId: "1:74416460249:web:15bc0a7c79ce65d010c9c8",
  measurementId: "G-1Q3TJ6F7FP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);