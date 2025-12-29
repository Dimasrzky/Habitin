// src/hooks/useSupabaseAuth.ts
import { useEffect } from 'react';
import { auth } from '../config/firebase.config';
import { supabase } from '../config/supabase.config';

export const useSupabaseAuth = () => {
  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log('🔄 Syncing Firebase user to Supabase...');
          
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Sign in to Supabase with Firebase token
          // Note: Ini memerlukan setup custom auth di Supabase
          // Untuk sekarang, kita akan gunakan workaround
          
          console.log('✅ Firebase user:', firebaseUser.uid);
          console.log('✅ Firebase email:', firebaseUser.email);
          
        } catch (error) {
          console.error('❌ Error syncing auth:', error);
        }
      } else {
        console.log('🔓 User logged out from Firebase');
        // Sign out dari Supabase juga
        await supabase.auth.signOut();
      }
    });

    return () => unsubscribe();
  }, []);
};