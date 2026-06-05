import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
 
  canActivate(): boolean | UrlTree {
    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/home']);
    }
 
    const role = this.auth.getRole();
 
    if (role === 'admin' || role === 'adminsys') {
      return true;
    }
 
    if (role === 'user') {
      return this.router.createUrlTree(['/user/dashboard']);
    }
 
    return this.router.createUrlTree(['/home']);
  }
}