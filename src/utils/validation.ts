export class Validation {
  static isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isPasswordValid(password: string): boolean {
    return password.length >= 6;
  }

  static isPasswordMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }

  static isNameValid(name: string): boolean {
    return name.trim().length >= 3;
  }

  static validateRegister(
    nama: string, 
    email: string, 
    password: string, 
    confirmPassword: string
  ): { valid: boolean; error?: string } {
    if (!nama || !email || !password || !confirmPassword) {
      return { valid: false, error: 'Semua field harus diisi' };
    }

    if (!this.isNameValid(nama)) {
      return { valid: false, error: 'Nama minimal 3 karakter' };
    }

    if (!this.isEmailValid(email)) {
      return { valid: false, error: 'Format email tidak valid' };
    }

    if (!this.isPasswordValid(password)) {
      return { valid: false, error: 'Password minimal 6 karakter' };
    }

    if (!this.isPasswordMatch(password, confirmPassword)) {
      return { valid: false, error: 'Password tidak cocok' };
    }

    return { valid: true };
  }

  static validateLogin(
    email: string, 
    password: string
  ): { valid: boolean; error?: string } {
    if (!email || !password) {
      return { valid: false, error: 'Email dan password harus diisi' };
    }

    if (!this.isEmailValid(email)) {
      return { valid: false, error: 'Format email tidak valid' };
    }

    return { valid: true };
  }
}