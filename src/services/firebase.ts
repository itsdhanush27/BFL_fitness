import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  onAuthStateChanged as fbOnAuthStateChanged,
  signInWithEmailAndPassword as fbSignInWithEmail,
  createUserWithEmailAndPassword as fbCreateUser,
  signOut as fbSignOut,
  GoogleAuthProvider,
  signInWithPopup as fbSignInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Safe environment or local configuration
const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyDemoDummyApiKeyForBFLFitnessApp123",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "bfl-fitness-demo.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "bfl-fitness-demo",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "bfl-fitness-demo.appspot.com",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (err) {
  console.warn("Firebase initialized in mock/resilient mode for preview environment", err);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

export { 
  app, 
  auth, 
  db, 
  storage, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  query, 
  where,
  fbSignInWithEmail,
  fbCreateUser,
  fbSignOut,
  fbSignInWithPopup,
  GoogleAuthProvider
};
export type { FirebaseUser };
