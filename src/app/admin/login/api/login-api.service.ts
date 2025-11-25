import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../interfaces/login.interface';

@Injectable({
  providedIn: 'root'
})
export class LoginApiService {
  private readonly apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  logout(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/logout`, {});
  }

  validateToken(): Observable<{ valid: boolean; user?: any }> {
    return this.http.get<{ valid: boolean; user?: any }>(`${this.apiUrl}/validate`);
  }
}