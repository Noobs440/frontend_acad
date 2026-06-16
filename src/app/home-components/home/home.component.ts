
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  isLoading = true;
  isLoggedIn = false;
  userName: string | null = null;
  sectionClass: string = 'recent-posts section';

  constructor(private userService: UserService) {}

  getDashboardLink(): string {
    // Vérifier d'abord si l'utilisateur est toujours authentifié
    const token = localStorage.getItem('token');
    if (!token) {
      // Si pas de token, rediriger vers le dashboard utilisateur par défaut
      return '/user/dashboard';
    }
    
    // On suppose que le rôle est stocké dans le localStorage sous 'role' (ex: 'admin', 'user', 'enseignant', 'adminsys')
    const role = localStorage.getItem('role');
    switch(role) {
      case 'admin':
        return '/admin/dashboard';
      case 'enseignant':
        return '/enseignant/dashboard';
      case 'adminsys':
        return '/adminsys';
      case 'superviseur':
        return '/admin/dashboard'; // Les superviseurs vont aussi au dashboard admin
      default:
        return '/user/dashboard';
    }
  }

  ngOnInit(): void {
    this.sectionClass = 'different-class';
    this.checkLoginState();
    
    // Écouter les changements d'état d'authentification
    this.userService.isUserLoggedIn$().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
    
    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  }

  checkLoginState() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    if (this.isLoggedIn) {
      this.userName = localStorage.getItem('name');
    } else {
      this.userName = null;
    }
  }

  getFullImageUrl(projectImage: string): string {
    if (!projectImage) {
      return '';
    }
    return projectImage.startsWith('http') ? projectImage : `https://dschangschoolhub.duckdns.org/${projectImage.replace(/^\/+/, '')}`;
  }
}
