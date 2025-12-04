import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, get, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasValidConfig = Object.values(firebaseConfig).every(Boolean);

let firebaseApp: FirebaseApp | null = null;
let database: Database | null = null;

if (hasValidConfig) {
  try {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
    database = getDatabase(firebaseApp);
  } catch (error) {
    console.warn('[Firebase] Failed to initialize:', error);
  }
} else {
  console.warn('[Firebase] Missing configuration values. Falling back to mock data.');
}

const normalizeCollection = <T extends Record<string, unknown>>(value: unknown): T[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(Boolean) as T[];
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, T>).map(([id, payload]) => ({
      id: (payload as Record<string, unknown>).id ?? id,
      ...payload,
    })) as T[];
  }
  return [];
};

export const db = database;
export const isFirebaseEnabled = Boolean(database);

export const fetchCollection = async <T extends Record<string, unknown>>(path: string): Promise<T[] | null> => {
  if (!database) return null;
  try {
    const snapshot = await get(ref(database, path));
    if (!snapshot.exists()) return null;
    return normalizeCollection<T>(snapshot.val());
  } catch (error) {
    console.error(`[Firebase] Failed to fetch collection at ${path}:`, error);
    return null;
  }
};

export const fetchValue = async <T>(path: string): Promise<T | null> => {
  if (!database) return null;
  try {
    const snapshot = await get(ref(database, path));
    if (!snapshot.exists()) return null;
    return snapshot.val() as T;
  } catch (error) {
    console.error(`[Firebase] Failed to fetch value at ${path}:`, error);
    return null;
  }
};
