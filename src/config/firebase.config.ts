import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { ENV_CONFIG } from './env.config';

// Validate config before initializing
const validateFirebaseConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId'];
  const missing = required.filter(
    (key) => !ENV_CONFIG.firebase[key as keyof typeof ENV_CONFIG.firebase]
  );

  if (missing.length > 0) {
    console.error('Missing Firebase config:', missing);
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  }
};

let app: FirebaseApp;
let auth: Auth;

try {
  // Validate config first
  validateFirebaseConfig();

  // Initialize Firebase
  if (getApps().length === 0) {
    console.log('Initializing Firebase...');
    app = initializeApp(ENV_CONFIG.firebase);
    console.log('Firebase initialized successfully');
  } else {
    app = getApp();
    console.log('Firebase already initialized');
  }

  // Initialize Auth (simple version without custom persistence)
  auth = getAuth(app);
  console.log('Firebase Auth initialized');
} catch (error) {
  console.error('Firebase initialization error:', error);
  
  // Create a fallback to prevent crashes
  if (getApps().length > 0) {
    app = getApp();
  } else {
    app = initializeApp({
      apiKey: 'dummy',
      authDomain: 'dummy',
      projectId: 'dummy',
      storageBucket: 'dummy',
      messagingSenderId: 'dummy',
      appId: 'dummy',
    });
  }
  auth = getAuth(app);
}

export { app, auth };

