
import { Component, OnInit } from '@angular/core';

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

  getDashboardLink(): string {
    // On suppose que le rôle est stocké dans le localStorage sous 'role' (ex: 'admin', 'user', 'enseignant')
    const role = localStorage.getItem('role');
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'enseignant') return '/enseignant/dashboard';
    return '/user/dashboard';
  }

  ngOnInit(): void {
    this.sectionClass = 'different-class';
    this.checkLoginState();
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
    return projectImage.startsWith('http') ? projectImage : `http://localhost:8000/${projectImage.replace(/^\/+/, '')}`;
  }
}
