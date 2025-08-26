import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// 🔥 PRODUCTION FIREBASE CONFIGURATION 🔥
// Your actual Firebase project configuration

const firebaseConfig = {
  apiKey: "AIzaSyDAdjw_uMxJJ3zTuOAceMphW98HZYouql8",
  authDomain: "daily-routine-uppi.firebaseapp.com",
  projectId: "daily-routine-uppi",
  storageBucket: "daily-routine-uppi.firebasestorage.app",
  messagingSenderId: "177369361405",
  appId: "1:177369361405:web:996147fcc56aae7bc68794"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Only connect to emulators in development mode
if (process.env.NODE_ENV === 'development') {
  try {
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔥 Connected to Firestore emulator on localhost:8080');
    
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('🔐 Connected to Auth emulator on localhost:9099');
  } catch (error) {
    console.warn('⚠️ Firebase emulators not running. Install and start them with:');
    console.warn('npm install -g firebase-tools');
    console.warn('firebase init emulators');
    console.warn('firebase emulators:start');
  }
}

export default app;
