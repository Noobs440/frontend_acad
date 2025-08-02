import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoginPopupComponent } from '../../home-components/modals/login-popup/login-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  @Input() bgColor: string = '';
  status: string = '';

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
    this.route.queryParams.subscribe(params => {
      this.status = params['status'] || '';
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
      console.log('The dialog was closed');
    });
  }

  isActive(routeFragment: string): boolean {
    return this.router.url === routeFragment;
  }
}
