import { environment } from './../../../environments/environment';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  user: any = {};
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private userService: UserService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // 1. Charger le cookie CSRF Laravel Sanctum
    this.http.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true }).subscribe({
      next: () => {
        // 2. Charger le profil utilisateur dans UserService (met à jour BehaviorSubject)
        this.userService.loadUserProfile();
        // 3. S’abonner aux changements du profil utilisateur
        this.userService.getUserProfile().subscribe({
          next: (data) => {
            this.user = data;
          },
          error: (error) => {
            console.error('Erreur lors de la récupération du profil utilisateur:', error);
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du cookie CSRF:', err);
      }
    });
  }

  triggerFile(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file: File = input.files[0];
      const formData = new FormData();
      formData.append('photo', file);

      this.userService.updatePhoto(formData).subscribe({
        next: (res: any) => {
          // La photo est mise à jour automatiquement via BehaviorSubject,
          // mais on met aussi à jour localement pour réactivité immédiate
          this.user.photo = res.photo;
          alert('Photo mise à jour avec succès.');
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de l’envoi de la photo.');
        }
      });
    }
  }

  get photoUrl(): string {
    if (!this.user.photo) {
      return 'assets/img/default.png'; // image par défaut locale
    }
    // Retourne l'URL complète si c'est une URL, sinon construit le chemin complet
    if (this.user.photo.startsWith('http')) {
      return this.user.photo;
    }
    return `http://localhost:8000/${this.user.photo}`; // exemple: 'images/nomfichier.jpg'
  }
}
