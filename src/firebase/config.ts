import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

// We prefer environment variables for flexibility, but fall back to the 
// generated applet config to ensure the app works in the AI Studio environment.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== '123456789'
    ? import.meta.env.VITE_FIREBASE_API_KEY 
    : firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN !== '123456789'
    ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN 
    : firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID && import.meta.env.VITE_FIREBASE_PROJECT_ID !== '123456789'
    ? import.meta.env.VITE_FIREBASE_PROJECT_ID 
    : firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET && import.meta.env.VITE_FIREBASE_STORAGE_BUCKET !== '123456789'
    ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET 
    : firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID && import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID !== '123456789'
    ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID 
    : firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID && import.meta.env.VITE_FIREBASE_APP_ID !== '123456789'
    ? import.meta.env.VITE_FIREBASE_APP_ID 
    : firebaseConfigJson.appId
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use the specific database ID from the config or environment
const rawDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
const isValidDbId = (val?: string) => 
  val && 
  val !== '123456789' && 
  val !== '(default)' && 
  val !== 'default' &&
  val.trim() !== '';

const databaseId = (isValidDbId(rawDbId) 
  ? rawDbId 
  : firebaseConfigJson.firestoreDatabaseId) || 'ai-studio-eliteimveis-9f091968-3795-4dec-9b45-0b116e2f9266';

export const db = getFirestore(app, databaseId);

export const storage = getStorage(app);
