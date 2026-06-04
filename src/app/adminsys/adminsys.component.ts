import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { LogoutConfirmDialogComponent } from '../shared/logout-confirm-dialog/logout-confirm-dialog.component';

@Component({
  selector: 'app-adminsys',
  templateUrl: './adminsys.component.html',
  styleUrls: ['./adminsys.component.css']
})
export class AdminsysComponent implements OnInit {
  userName: string = '';
  userPhoto: string = 'assets/img/default.png';

  constructor(private userService: UserService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.userService.loadUserProfile();
    this.userService.getUserProfile().subscribe({
      next: (userData) => {
        this.userName = userData?.nom_user || 'Utilisateur';
        this.userPhoto = this.getFullImageUrl(userData?.photo);
      },
      error: () => {
        this.userName = 'Utilisateur';
        this.userPhoto = 'assets/img/default.png';
      }
    });
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) {
      return 'assets/img/default.png';
    }
    return imagePath.startsWith('http') ? imagePath : `http://localhost:8000/${imagePath.replace(/^\/+/g, '')}`;
  }

  logout(): void {
    const dialogRef = this.dialog.open(LogoutConfirmDialogComponent, {
      width: '350px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) { 
        localStorage.clear();
        window.location.href = '/home';
      }
    });
  }
}
