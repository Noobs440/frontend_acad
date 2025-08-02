import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-password.component.html',
  styleUrls: ['./edit-password.component.css']
})
export class EditPasswordComponent {
  oldPassword = '';
  newPassword = '';
  message = '';

  constructor(private userService: UserService) {}

  submit() {
    this.userService.updatePassword({
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => this.message = 'Mot de passe modifié',
      error: () => this.message = 'Erreur lors de la modification'
    });
  }
}
