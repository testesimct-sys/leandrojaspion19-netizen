import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfigJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const isValidConfig = (val?: string) => val && val !== '123456789' && val !== 'your-api-key';

const firebaseConfig = {
  apiKey: isValidConfig(process.env.VITE_FIREBASE_API_KEY) ? process.env.VITE_FIREBASE_API_KEY : firebaseConfigJson.apiKey,
  authDomain: isValidConfig(process.env.VITE_FIREBASE_AUTH_DOMAIN) ? process.env.VITE_FIREBASE_AUTH_DOMAIN : firebaseConfigJson.authDomain,
  projectId: isValidConfig(process.env.VITE_FIREBASE_PROJECT_ID) ? process.env.VITE_FIREBASE_PROJECT_ID : firebaseConfigJson.projectId,
  storageBucket: isValidConfig(process.env.VITE_FIREBASE_STORAGE_BUCKET) ? process.env.VITE_FIREBASE_STORAGE_BUCKET : firebaseConfigJson.storageBucket,
  messagingSenderId: isValidConfig(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID) ? process.env.VITE_FIREBASE_MESSAGING_SENDER_ID : firebaseConfigJson.messagingSenderId,
  appId: isValidConfig(process.env.VITE_FIREBASE_APP_ID) ? process.env.VITE_FIREBASE_APP_ID : firebaseConfigJson.appId
};

const app = initializeApp(firebaseConfig);
const isValidDbId = (val?: string) => 
  val && 
  val !== '123456789' && 
  val !== '(default)' && 
  val !== 'default' &&
  val.trim() !== '';

const databaseId = (isValidDbId(process.env.VITE_FIREBASE_DATABASE_ID) 
  ? process.env.VITE_FIREBASE_DATABASE_ID 
  : firebaseConfigJson.firestoreDatabaseId) || 'ai-studio-eliteimveis-9f091968-3795-4dec-9b45-0b116e2f9266';
export const db = getFirestore(app, databaseId);
