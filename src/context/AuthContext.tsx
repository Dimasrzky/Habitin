// src/contexts/AuthContext.tsx

import { auth } from '@/config/firebase.config';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 [AuthContext] Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔐 [AuthContext] Auth state changed:', currentUser?.email || 'No user');
      console.log('🔐 [AuthContext] User UID:', currentUser?.uid || 'No UID');
      
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      console.log('🔐 [AuthContext] Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Debug log setiap render
  console.log('🔐 [AuthContext] Current state - User:', user?.email, 'Loading:', loading);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}