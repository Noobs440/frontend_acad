import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrl: './default.component.css'
})
export class DefaultComponent {
  showNav: boolean = true;
  isLoggedIn: boolean = false;
  userName: string | null = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.checkRoute();
      this.checkLoginState();
    });
    this.checkRoute();
    this.checkLoginState();
  }

  checkRoute(): void {
    const currentUrl = this.router.url;
    this.showNav = !currentUrl.includes('/home/category');
  }

  checkLoginState(): void {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    this.userName = this.isLoggedIn ? localStorage.getItem('name') : null;
  }
}
