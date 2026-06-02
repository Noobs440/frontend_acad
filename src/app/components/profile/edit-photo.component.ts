import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-photo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-photo.component.html',
  styleUrls: ['./edit-photo.component.css']
})
export class EditPhotoComponent implements OnInit {
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null; // Prévisualisation
  message = '';
  user: any = {}; // Stocke les infos utilisateur

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.userService.getUserProfile().subscribe({
      next: (data) => this.user = data,
      error: () => this.message = 'Erreur lors du chargement du profil.'
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;

      // Prévisualisation de l'image sélectionnée
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (!this.selectedFile) {
      this.message = 'Veuillez sélectionner une photo.';
      return;
    }

    const formData = new FormData();
    formData.append('photo', this.selectedFile);

    this.userService.updatePhoto(formData).subscribe({
      next: (res: any) => {
        this.message = 'Photo mise à jour avec succès.';
        this.selectedFile = null;
        this.previewUrl = null;

        // Met à jour la photo utilisateur avec l’URL complète renvoyée par le backend
        this.user.photo = res.photo;
      },
      error: () => this.message = 'Erreur lors du téléversement.'
    });
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
