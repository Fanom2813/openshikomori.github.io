import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate config
const validateConfig = () => {
  const required = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID'];
  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn(
      '[Firebase] Missing environment variables:',
      missing.join(', '),
      '\nContribution features will not work until Firebase is configured.'
    );
    return false;
  }
  return true;
};

export const isFirebaseConfigured = validateConfig();

// Initialize Firebase only if configured and not already initialized
export const app = isFirebaseConfigured
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Collection references helper
export const collections = {
  users: 'users',
  clips: 'clips',
  corrections: 'corrections',
  config: 'config',
} as const;

// Helper to check if Firebase is ready
export const isFirebaseReady = (): boolean => {
  return !!(app && auth && db);
};
