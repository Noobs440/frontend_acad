import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-name',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-name.component.html',
  styleUrls: ['./edit-name.component.css']
})
export class EditNameComponent {
  nom_user = '';
  surname = '';
  message = '';

  constructor(private userService: UserService) {}

  submit() {
    this.userService.updateName({ nom_user: this.nom_user, surname: this.surname }).subscribe({
      next: () => this.message = 'Nom modifié avec succès',
      error: () => this.message = 'Erreur lors de la modification du nom'
    });
  }
}
