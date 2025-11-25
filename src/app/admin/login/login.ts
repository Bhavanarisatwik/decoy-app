import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from './services/login.service';
import { LoginRequest, LoginResponse } from './interfaces/login.interface';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  username = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(private loginService: LoginService) {}

  onSubmit(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);

    const credentials: LoginRequest = {
      username: this.username(),
      password: this.password()
    };

    this.loginService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading.set(false);
        if (response.success) {
          console.log('Login successful:', response);
          // TODO: Navigate to dashboard
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'An error occurred during login');
        console.error('Login error:', error);
      }
    });
  }
}
