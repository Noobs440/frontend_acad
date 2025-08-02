import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrl: './default.component.css'
})
export class DefaultComponent {
  showNav: boolean = true;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.checkRoute();
    });
    this.checkRoute(); // Initial check
  }

  checkRoute(): void {
    const currentUrl = this.router.url;
    this.showNav = !currentUrl.includes('/home/category');
  }
}
