# 🚀 Quick Start Guide

Want to test your daily routine app right now? Here are the fastest ways to get started:

## 🎯 Option 1: Test Without Firebase (Simplest)

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Open your browser:**
   Navigate to `http://localhost:3000`

3. **You'll see the authentication screen** - but since Firebase isn't configured, you can't sign in yet.

## 🔥 Option 2: Use Firebase Emulators (Recommended for Testing)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase emulators:**
   ```bash
   firebase init emulators
   ```
   - Choose Firestore and Authentication emulators
   - Use default ports (8080 for Firestore, 9099 for Auth)

3. **Start emulators:**
   ```bash
   firebase emulators:start
   ```

4. **Copy demo config:**
   ```bash
   cp src/services/firebase.demo.ts src/services/firebase.ts
   ```

5. **Start your app:**
   ```bash
   npm start
   ```

6. **Test the app:**
   - Sign up with any email/password
   - Create todos, shopping lists, meals, etc.
   - Data will be stored locally in the emulators

## ☁️ Option 3: Real Firebase (Production Ready)

1. **Follow the full setup guide:**
   See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

2. **Update your config:**
   Replace the placeholder values in `src/services/firebase.ts`

3. **Deploy to production:**
   Your app will work with real cloud database!

## 🎮 What You Can Test

- **User Authentication** - Sign up, sign in, sign out
- **Real-time Database** - Add/edit/delete items
- **Cross-device Sync** - Open multiple browser tabs
- **Offline Support** - Disconnect internet and continue using
- **Data Persistence** - Your data stays between sessions

## 🆘 Need Help?

- **Emulator issues?** Check the Firebase CLI documentation
- **Want real Firebase?** Follow the detailed setup guide
- **App not working?** Check the browser console for errors

## 🎉 Ready to Go!

Choose Option 2 (emulators) for the best testing experience, or Option 3 (real Firebase) for production use. Option 1 is just to see the app structure.

Happy organizing! 🎯✨
