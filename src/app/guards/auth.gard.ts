import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('token');

    // 🔐 Si token trouvé, autoriser l'accès
    if (token) {
      return true;
    }

    // ❌ Sinon, rediriger vers la page d'accueil (ou login si tu en as une)
    return this.router.createUrlTree(['/home']);
  }
}
