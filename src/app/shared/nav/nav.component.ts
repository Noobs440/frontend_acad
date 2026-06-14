

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LoginPopupComponent } from '../../home-components/modals/login-popup/login-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { LogoutConfirmDialogComponent } from '../logout-confirm-dialog/logout-confirm-dialog.component';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  @Input() bgColor: string = '';
  @Input() isLoggedIn: boolean = false;
  @Input() userName: string | null = null;
  status: string = '';
  mobileNavActive = false;

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private dialog: MatDialog,
    private router: Router
  ) {
    // Définir les langues disponibles
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      if (this.mobileNavActive) {
        this.closeMobileNav();
      }
    });
  }

  switchLanguage(language: string): void {
    this.translate.use(language);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(LoginPopupComponent, {
      width: '387px',
      height: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      // Dialog closed
    });
  }

  isActive(routeFragment: string): boolean {
    return this.router.url === routeFragment;
  }
  public toggleMobileNav = (): void => {
    this.mobileNavActive = !this.mobileNavActive;
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.toggle('mobile-nav-active', this.mobileNavActive);
    }
  };

  closeMobileNav(): void {
    this.mobileNavActive = false;
    document.body.classList.remove('mobile-nav-active');
  }

  logout(): void {
    const dialogRef = this.dialog.open(LogoutConfirmDialogComponent, {
      width: '350px'
    });
    dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (typeof localStorage !== 'undefined') {
            localStorage.clear();
          }
          this.router.navigate(['/home']).then(() => {
            if (typeof window !== 'undefined' && window.location) {
              window.location.reload();
            }
          });
        }
    });
  }
}
