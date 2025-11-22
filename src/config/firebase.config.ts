import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { ENV_CONFIG } from './env.config';

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(ENV_CONFIG.firebase);
} else {
  app = getApp();
}

// Initialize Auth (tanpa custom persistence, Firebase akan handle otomatis)
const auth = getAuth(app);

export { app, auth };
