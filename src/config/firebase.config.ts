import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { ENV_CONFIG } from './env.config';

let app: FirebaseApp;
let auth: Auth;

try {
  // Check if Firebase already initialized
  if (getApps().length > 0) {
    app = getApp();
    auth = getAuth(app);
    console.log('ℹ️ Using existing Firebase instance');
  } else {
    // First time initialization
    const firebaseConfig = ENV_CONFIG.firebase;
    
    console.log('🔥 Initializing Firebase...');
    app = initializeApp(firebaseConfig);
    
    // Use getAuth directly (simpler and more compatible)
    auth = getAuth(app);
    
    console.log('✅ Firebase initialized successfully');
  }
} catch (error: any) {
  console.error('❌ Firebase initialization error:', error.message);
  
  // Fallback: Create basic instance
  if (getApps().length === 0) {
    app = initializeApp({
      apiKey: 'AIzaSyDummy-Key-For-Development',
      authDomain: 'dummy.firebaseapp.com',
      projectId: 'dummy-project',
      storageBucket: 'dummy.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:dummy',
    });
  } else {
    app = getApp();
  }
  
  auth = getAuth(app);
  console.log('⚠️ Using fallback Firebase configuration');
}

export { app, auth };

