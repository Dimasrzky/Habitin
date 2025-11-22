import {
    Auth,
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { auth } from '../../config/firebase.config';

export class FirebaseAuthService {
  private static authInstance: Auth = auth;

  // Register user
  static async register(email: string, password: string, displayName?: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.authInstance,
        email,
        password
      );

      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      return {
        user: userCredential.user,
        error: null,
      };
    } catch (error: any) {
      return {
        user: null,
        error: error.message,
      };
    }
  }

  // Login user
  static async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.authInstance,
        email,
        password
      );

      return {
        user: userCredential.user,
        error: null,
      };
    } catch (error: any) {
      return {
        user: null,
        error: error.message,
      };
    }
  }

  // Logout user
  static async logout() {
    try {
      await signOut(this.authInstance);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.authInstance, email);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return this.authInstance.currentUser;
  }

  // Get ID Token
  static async getIdToken(forceRefresh = false): Promise<string | null> {
    const user = this.authInstance.currentUser;
    if (!user) return null;

    try {
      return await user.getIdToken(forceRefresh);
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }
}