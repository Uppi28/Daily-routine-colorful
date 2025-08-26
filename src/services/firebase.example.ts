import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// 🔥 COPY THIS FILE TO firebase.ts AND REPLACE WITH YOUR CONFIG 🔥

// Your Firebase configuration - Get this from Firebase Console
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines if you want to use Firebase emulators for development
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
}

export default app;

/*
🚀 QUICK SETUP STEPS:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Click the gear icon ⚙️ → Project settings
4. Scroll down to "Your apps" section
5. Click the web icon (</>) to add a web app
6. Copy the config object above
7. Replace the placeholder values in this file
8. Rename this file to `firebase.ts`
9. Enable Authentication and Firestore in Firebase Console

📚 For detailed setup instructions, see FIREBASE_SETUP.md
*/
