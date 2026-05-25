import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CreateUserRequest, LoginRequest, LoginResponse, UserResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'shortly_token';
  private readonly USER_KEY = 'shortly_user';

  isLoggedIn = signal(this.hasToken());
  currentUsername = signal<string>(this.getStoredUsername());

  constructor(private http: HttpClient) {}

  register(request: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>('/api/users', request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .request<LoginResponse>('POST', '/api/users/login', {
        body: request,
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        responseType: 'json',
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem(this.USER_KEY, res.username);
          this.isLoggedIn.set(true);
          this.currentUsername.set(res.username);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isLoggedIn.set(false);
    this.currentUsername.set('');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private hasToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  private getStoredUsername(): string {
    return localStorage.getItem(this.USER_KEY) ?? '';
  }
}
