import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// 🚨 DEMO CONFIGURATION - FOR TESTING ONLY! 🚨
// This uses Firebase emulators for local development
// In production, use your own Firebase project

const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project-id",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Always connect to emulators in demo mode
// This allows you to test the app without setting up Firebase
if (process.env.NODE_ENV === 'development' || true) {
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

/*
🚀 QUICK START WITH EMULATORS:

1. Install Firebase CLI:
   npm install -g firebase-tools

2. Initialize Firebase project:
   firebase init emulators

3. Start emulators:
   firebase emulators:start

4. The app will automatically connect to local emulators

📚 For production setup, see FIREBASE_SETUP.md
*/
