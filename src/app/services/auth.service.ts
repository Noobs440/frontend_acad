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

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    // Mock login logic — à remplacer par ton API d’auth réelle
    let user: User | null = null;

    if (username === 'admin' && password === 'ADMINadmin123') {
      user = { id: 1, username, role: 'admin' };
    } else if (username === 'user' && password === 'User123user') {
      user = { id: 2, username, role: 'user' };
    }

    if (user) {
      this.setUser(user);
      return true;
    }

    return false;
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getRole(): string {
    return this.getUser()?.role || '';
  }

  getUserId(): number | null {
    return this.getUser()?.id || null;
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/']);
  }
}
