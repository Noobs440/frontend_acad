import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class UserGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
 
  canActivate(): boolean | UrlTree {
    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/home']);
    }
 
    const role = this.auth.getRole();
 
    if (role === 'user') {
      return true;
    }
 
    if (role === 'admin' || role === 'adminsys') {
      return this.router.createUrlTree(['/admin/dashboard']);
    }
 
    return this.router.createUrlTree(['/home']);
  }
}