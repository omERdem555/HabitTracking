import { initializeApp } from 'firebase/app';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';

import { getMessaging } from 'firebase/messaging';


const firebaseConfig = {
  apiKey: 'AIzaSyCwQ6ilSsHfgJfyooDuJhcI4SCrSmwe7YY',
  authDomain: 'habit-tracker-e4d82.firebaseapp.com',
  projectId: 'habit-tracker-e4d82',
  storageBucket: 'habit-tracker-e4d82.firebasestorage.app',
  messagingSenderId: '41819438398',
  appId: '1:41819438398:web:e059660ac9f485dfb4806f',
  measurementId: 'G-P4K2NR598B',
};


export const firebaseApp = initializeApp(firebaseConfig);


/* AUTH */

export const auth = getAuth(firebaseApp);

const googleProvider = new GoogleAuthProvider();

export const loginEmail = (
  email: string,
  password: string,
) => {
  return signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
};

export const registerEmail = (
  email: string,
  password: string,
) => {
  return createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
};

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};


/* FIRESTORE */

export const db = getFirestore(firebaseApp);


/* FCM */

export const messaging = getMessaging(firebaseApp);