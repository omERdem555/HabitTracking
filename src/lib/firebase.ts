/**********************************************
 * 1. CORE FIREBASE INITIALIZATION
 **********************************************/
import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCwQ6ilSsHfgJfyooDuJhcI4SCrSmwe7YY",
  authDomain: "habit-tracker-e4d82.firebaseapp.com",
  projectId: "habit-tracker-e4d82",
  storageBucket: "habit-tracker-e4d82.firebasestorage.app",
  messagingSenderId: "41819438398",
  appId: "1:41819438398:web:e059660ac9f485dfb4806f",
  measurementId: "G-P4K2NR598B"
};

export const firebaseApp = initializeApp(firebaseConfig);


/**********************************************
 * 2. FIREBASE AUTH (NEW - USER ID LAYER)
 **********************************************/
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

export const auth = initializeAuth(firebaseApp, {
  persistence: browserLocalPersistence
});


/**
 * Google OAuth provider
 * - Cross-device login için en hızlı yöntem
 */
const googleProvider = new GoogleAuthProvider();


/**
 * Email / Password Login
 * - klasik authentication flow
 */
export const loginEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};


/**
 * Email / Password Register
 * - yeni user creation
 */
export const registerEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};


/**
 * Google Login
 * - popup-based authentication
 */
export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};


/**********************************************
 * 3. FIREBASE CLOUD MESSAGING (EXISTING)
 **********************************************/
import { getMessaging } from 'firebase/messaging';

export const messaging = getMessaging(firebaseApp);