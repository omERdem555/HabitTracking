/**********************************************
 * 1. CORE FIREBASE INITIALIZATION
 **********************************************/
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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

export const auth = getAuth(firebaseApp);


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