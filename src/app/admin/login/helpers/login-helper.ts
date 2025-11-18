import { LoginRequest } from '../interfaces/login.interface';

export class LoginHelper {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
  }

  static validateLoginForm(credentials: LoginRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!credentials.username || credentials.username.trim() === '') {
      errors.push('Username is required');
    }

    if (!credentials.password || credentials.password.trim() === '') {
      errors.push('Password is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static sanitizeUsername(username: string): string {
    return username.trim().toLowerCase();
  }
}