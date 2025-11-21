import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AuthService from '../services/auth.service';
import StorageService from '../utils/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isFirstLaunch: boolean;
  isLoading: boolean;
  userId: string | null;
  userEmail: string | null;
  setAuthenticated: (value: boolean) => void;
  setFirstLaunch: (value: boolean) => void;
  setUserId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isFirstLaunch: true,
  isLoading: true,
  userId: null,
  userEmail: null,
  setAuthenticated: () => {},
  setFirstLaunch: () => {},
  setUserId: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const hasLaunched = await StorageService.getHasLaunched();
      setIsFirstLaunch(!hasLaunched);

      const user = AuthService.getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        setUserEmail(user.email);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
    if (value) {
      const user = AuthService.getCurrentUser();
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email);
      }
    } else {
      setUserId(null);
      setUserEmail(null);
    }
  };

  const setFirstLaunch = async (value: boolean) => {
    setIsFirstLaunch(value);
    if (!value) {
      await StorageService.setHasLaunched();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isFirstLaunch,
        isLoading,
        userId,
        userEmail,
        setAuthenticated,
        setFirstLaunch,
        setUserId,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);