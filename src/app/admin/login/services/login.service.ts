import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LoginApiService } from '../api/login-api.service';
import { LoginRequest, LoginResponse, User } from '../interfaces/login.interface';
import { LoginHelper } from '../helpers/login-helper';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginApi = inject(LoginApiService);
  private platformId = inject(PLATFORM_ID);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.checkStoredAuth();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const validation = LoginHelper.validateLoginForm(credentials);
    
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    const sanitizedCredentials: LoginRequest = {
      username: LoginHelper.sanitizeUsername(credentials.username),
      password: credentials.password
    };

    return this.loginApi.login(sanitizedCredentials).pipe(
      tap(response => {
        if (response.success && response.token && response.user) {
          this.setAuthData(response.token, response.user);
        }
      })
    );
  }

  logout(): Observable<{ success: boolean; message: string }> {
    return this.loginApi.logout().pipe(
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  private setAuthData(token: string, user: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private checkStoredAuth(): void {
    // Only access localStorage in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        } catch (error) {
          this.clearAuthData();
        }
      }
    }
  }

  getAuthToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}