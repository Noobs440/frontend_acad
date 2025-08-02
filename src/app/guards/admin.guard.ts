import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // Pas connecté, redirection vers home/login
    return this.router.createUrlTree(['/home']);
  }

  if (role === 'admin') {
    return true;
  }

  // Utilisateur connecté mais pas admin, redirection vers son dashboard
  if (role === 'user') {
    return this.router.createUrlTree(['/user/dashboard']);
  }

  // Autres cas, rediriger à home
  return this.router.createUrlTree(['/home']);
}

}
