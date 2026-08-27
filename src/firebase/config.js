// ============================================
// FIREBASE CONFIG — FootballHub
// ============================================

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD7DHA4wHgi4Xugvvs1bJtf0iiAFnr0MUM",
  authDomain: "footballhub-15fc1.firebaseapp.com",
  projectId: "footballhub-15fc1",
  storageBucket: "footballhub-15fc1.firebasestorage.app",
  messagingSenderId: "441629768828",
  appId: "1:441629768828:web:6b16dfde370e24586a5df9",
  measurementId: "G-E8BDSC6SME"
};

let app = null;
let db = null;
let auth = null;
let analytics = null;

export function initFirebase() {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    analytics = getAnalytics(app);
    console.log('✅ Firebase initialized — footballhub-15fc1');
    return true;
  } catch (error) {
    console.error('❌ Firebase init error:', error);
    return false;
  }
}

export { db, auth, analytics };
