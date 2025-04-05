import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCJfseC2Ik7Ffdz22zVH_4Tkjc9UQSu3lM",
  authDomain: "litfunds-1dede.firebaseapp.com",
  projectId: "litfunds-1dede",
  storageBucket: "litfunds-1dede.firebasestorage.app",
  messagingSenderId: "360065921344",
  appId: "1:360065921344:web:7ff8231882983b23c08aa5",
  measurementId: "G-584F5CTWMP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

export { app, auth, db, analytics };