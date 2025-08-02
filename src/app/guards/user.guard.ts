import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return this.router.createUrlTree(['/home']);
  }

  if (role === 'user') {
    return true;
  }

  if (role === 'admin') {
    return this.router.createUrlTree(['/admin/dashboard']);
  }

  return this.router.createUrlTree(['/home']);
}

}
