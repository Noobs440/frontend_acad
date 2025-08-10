import { Component, OnInit } from '@angular/core';
import { UserManagementService } from '../../services/user-management.service';
import { MatDialog } from '@angular/material/dialog';
import { ResetPasswordDialogComponent } from '../reset-password-dialog/reset-password-dialog.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  filieres: any[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  searchTerm = '';
  sortAsc = true;

  isModalOpen = false;
  isEditMode = false;

  currentUser: any = {
    nom_user: '',
    email: '',
    password: '',
    matricule: '',
    tbl_filiere_id: '',
    role: 'user'  // Par défaut user pour création
  };

  errorMessage: string = '';

  // Pour popup confirmation suppression
  showConfirmModal: boolean = false;
  userToDelete: any = null;

  // Pour popup confirmation enregistrement
  showConfirmSaveModal: boolean = false;

  constructor(private userService: UserManagementService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadFilieres();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      this.applyFilters();
    });
  }

  loadFilieres(): void {
    this.userService.getFilieres().subscribe(data => {
      this.filieres = data;
      this.applyFilters();
    });
  }

  getFiliereName(id: number): string {
    const fil = this.filieres.find(f => f.id === id);
    return fil ? fil.nom_fil : 'Filiere inconnue';
  }

  applyFilters(): void {
    let temp = this.users.filter(u =>
      u.nom_user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    temp.sort((a, b) => {
      return this.sortAsc
        ? a.nom_user.localeCompare(b.nom_user)
        : b.nom_user.localeCompare(a.nom_user);
    });

    this.totalPages = Math.ceil(temp.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;

    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredUsers = temp.slice(start, start + this.pageSize);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleSort(): void {
    this.sortAsc = !this.sortAsc;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilters();
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.errorMessage = '';
    this.currentUser = {
      nom_user: '',
      email: '',
      password: '',
      matricule: '',
      tbl_filiere_id: '',
      role: 'user'
    };
    this.isModalOpen = true;
  }

  openResetPasswordDialog(user: any) {
    const dialogRef = this.dialog.open(ResetPasswordDialogComponent, {
      width: '400px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Message succès éventuel ici
      }
    });
  }

  openEditModal(user: any): void {
    console.log('openEditModal appelé', user);
    this.isEditMode = true;
    this.errorMessage = '';
    this.currentUser = { ...user, password: '' }; // password vide en modif
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.errorMessage = '';
  }

  // Cette méthode est appelée par le bouton Enregistrer/Ajouter dans le modal
  askConfirmSave(): void {
    if (this.isEditMode) {
      // En mode édition, afficher la confirmation avant d'enregistrer
      this.showConfirmSaveModal = true;
    } else {
      // En mode ajout, enregistrer directement
      this.saveUser();
    }
  }

  // Confirmer l'enregistrement après popup
  confirmSave(): void {
    this.showConfirmSaveModal = false;
    this.saveUser();
  }

  // Annuler l'enregistrement (ferme popup confirmation)
  cancelSave(): void {
    this.showConfirmSaveModal = false;
  }

  saveUser(): void {

    if (!this.currentUser.email.trim()) {
      this.errorMessage = "L'email est obligatoire.";
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.currentUser.email)) {
      this.errorMessage = "L'email n'est pas valide.";
      return;
    }

    if (!this.currentUser.nom_user.trim() || !this.currentUser.email.trim()) {
      this.errorMessage = 'Nom et email sont obligatoires.';
      return;
    }

    if (!this.currentUser.matricule.trim()) {
      this.errorMessage = 'Le matricule est obligatoire.';
      return;
    }

    const matriculeRegex = /^CM-UDS-/;

    if (!matriculeRegex.test(this.currentUser.matricule)) {
      this.errorMessage = 'Le matricule DOIT COMMENCER PAR "CM-UDS-".';
      return;
    }

    if (!this.isEditMode && !this.currentUser.password.trim()) {
      this.errorMessage = 'Le mot de passe est obligatoire à la création.';
      return;
    }

    if (this.isEditMode) {
      this.userService.updateUser(this.currentUser.id, this.currentUser).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: err => {
          this.errorMessage = err.error?.error || 'Erreur lors de la mise à jour.';
        }
      });
    } else {
      this.userService.createUser(this.currentUser).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: err => {
          this.errorMessage = err.error?.error || 'Erreur lors de la création.';
        }
      });
    }
  }

  // Ouverture popup confirmation suppression
  openConfirmDelete(user: any) {
    this.userToDelete = user;
    this.showConfirmModal = true;
  }

  confirmDelete() {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id).subscribe({
        next: () => this.loadUsers(),
        error: err => alert(err.error?.error || 'Erreur lors de la suppression.')
      });
    }
    this.closeConfirmModal();
  }

  cancelDelete() {
    this.closeConfirmModal();
  }

  private closeConfirmModal() {
    this.showConfirmModal = false;
    this.userToDelete = null;
  }
}
