import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminsysGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const role = this.auth.getRole();
    if (role === 'adminsys') {
      return true;
    }
    // Redirige vers la page d'accueil ou login si non adminsys
    this.router.navigate(['/']);
    return false;
  }
}
