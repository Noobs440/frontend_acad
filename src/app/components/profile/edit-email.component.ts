import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';  // ajuste le chemin si nécessaire

@Component({
  selector: 'app-edit-email',
  templateUrl: './edit-email.component.html',
 // styleUrls: ['./edit-email.component.scss']
})
export class EditEmailComponent {
  email: string = '';
  message: string = '';
  error: string = '';

  constructor(private userService: UserService) {}

  updateEmail() {
    this.message = '';
    this.error = '';

    this.userService.updateEmail({ email: this.email }).subscribe({
      next: () => {
        this.message = 'Email mis à jour avec succès.';
      },
      error: err => {
        this.error = err.error?.message || 'Erreur lors de la mise à jour de l’email.';
      }
    });
  }
}
