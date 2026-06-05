import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'currentUser';
  private readonly TOKEN_KEY = 'token';

  constructor(private router: Router) {}

  // Appelé après login réussi depuis LoginPopupComponent
  setSession(token: string, user: User): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    const userStr = sessionStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Le rôle vient toujours de la session, elle-même alimentée par /api/user au login
  getRole(): string {
    return this.getUser()?.role || '';
  }

  getUserId(): number | null {
    return this.getUser()?.id ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/']);
  }
}