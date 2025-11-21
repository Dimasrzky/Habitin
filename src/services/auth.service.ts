import {
    getCurrentUser,
    loginWithEmail,
    logout,
    registerWithEmail
} from '../config/firebase.config';
import { LoginCredentials, RegisterCredentials } from '../types/auth.types';

class AuthService {
  async register(credentials: RegisterCredentials) {
    const { email, password } = credentials;
    return await registerWithEmail(email, password);
  }

  async login(credentials: LoginCredentials) {
    const { email, password } = credentials;
    return await loginWithEmail(email, password);
  }

  async logout() {
    return await logout();
  }

  getCurrentUser() {
    return getCurrentUser();
  }

  isAuthenticated(): boolean {
    return getCurrentUser() !== null;
  }
}

export default new AuthService();