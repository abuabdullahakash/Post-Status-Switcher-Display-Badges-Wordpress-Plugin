import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import localConfig from '../../firebase-applet-config.json';

// Support overriding via environment variables for deployments (like Vercel)
const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || localConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || localConfig.appId,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || localConfig.firestoreDatabaseId
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Let's validate the Firebase connection on startups as per the skill's directive
async function testConnection() {
  try {
    const testDocRef = doc(db, 'test_connection_metadata', 'probe');
    await getDocFromServer(testDocRef);
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or network status.");
    }
  }
}
testConnection();
