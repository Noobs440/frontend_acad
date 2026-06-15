import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private get storage(): Storage | null {
    return isPlatformBrowser(this.platformId) && typeof sessionStorage !== 'undefined'
      ? sessionStorage
      : null;
  }

  // Appelé après login réussi depuis LoginPopupComponent
  setSession(token: string, user: User): void {
    this.storage?.setItem(this.TOKEN_KEY, token);
    this.storage?.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getToken(): string | null {
    return this.storage?.getItem(this.TOKEN_KEY) ?? null;
  }

  getUser(): User | null {
    const userStr = this.storage?.getItem(this.USER_KEY);
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
    this.storage?.removeItem(this.TOKEN_KEY);
    this.storage?.removeItem(this.USER_KEY);
    this.router.navigate(['/']);
  }
}