import { Component, OnInit } from '@angular/core';
import { ProjetService } from '../../services/projet.service';
import { UserManagementService } from '../../services/user-management.service';
import { normalizeString } from '../../utils/string-utils';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../../shared/info-dialog/info-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  projects: any[] = [];
  filteredProjects: any[] = [];
  niveaux: any[] = [];
  categories: any[] = [];
  utilisateurs: any[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  searchTerm = '';
  sortAsc = true;

  isModalOpen = false;
  isEditMode = false;
  currentProject: any = {
    titre_projet: '',
    descript_projet: '',
    tbl_niveau_id: '',
    tbl_categorie_id: '',
    user_id: '',
    type: 'Projet',
    soumis: false,
    status: 'Not Submitted',
    image: ''
  };

  selectedFile: File | null = null;
  selectedUserName: string = '';

  // Confirmation modals
  showConfirmSaveModal = false;
  showConfirmDeleteModal = false;
  projectToDelete: any = null;

  // Spinner flags
  isSaving: boolean = false;
  isDeleting: boolean = false;

  userSearch$ = new Subject<string>();

  constructor(private projetService: ProjetService, private userManage: UserManagementService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadDropdowns();
    this.loadUtilisateurs();

    // Autocomplete utilisateur
    this.userSearch$.pipe(
      debounceTime(300),
      switchMap(term => term ? this.searchUsers(term) : of([]))
    ).subscribe(users => this.utilisateurs = users);
  }

  loadProjects(): void {
    this.projetService.getAllProjects().subscribe(data => {
      this.projects = data;
      this.applyFilters();
    });
  }

  loadDropdowns(): void {
    this.projetService.getNiveaux().subscribe(n => this.niveaux = n);
    this.projetService.getCategories().subscribe(c => this.categories = c);
  }

  loadUtilisateurs(): void {
    this.userManage.getUsers().subscribe(users => this.utilisateurs = users);
  }

  onUserSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedUserName = input.value;
    this.userSearch$.next(this.selectedUserName);
  }

  selectUser(user: any) {
    this.currentProject.user_id = user.id;
    this.selectedUserName = user.nom_user;
    this.utilisateurs = [];
  }

  searchUsers(term: string) {
    return this.userManage.searchUsers(term); // méthode côté service qui recherche les utilisateurs par nom/email
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  applyFilters(): void {
    let temp = this.projects.filter(p =>
      p.titre_projet.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    temp.sort((a, b) => this.sortAsc
        ? a.titre_projet.localeCompare(b.titre_projet)
        : b.titre_projet.localeCompare(a.titre_projet)
    );

    this.totalPages = Math.ceil(temp.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;

    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredProjects = temp.slice(start, start + this.pageSize);
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
    this.currentProject = {
      titre_projet: '',
      descript_projet: '',
      tbl_niveau_id: '',
      tbl_categorie_id: '',
      user_id: '',
      type: 'Projet',
      soumis: false,
      status: 'Not Submitted',
      image: ''
    };
    this.selectedUserName = '';
    this.selectedFile = null;
    this.isModalOpen = true;
  }

  openEditModal(project: any): void {
    this.isEditMode = true;
    this.currentProject = { ...project };
    this.selectedUserName = project.nom_utilisateur || '';
    this.selectedFile = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveProject(): void {
    if (!this.currentProject.titre_projet.trim() || !this.currentProject.descript_projet.trim() || !this.currentProject.user_id) {
      this.dialog.open(InfoDialogComponent, { width: '380px', data: { title: 'Erreur', message: 'Veuillez remplir tous les champs requis.' } });
      return;
    }
    this.showConfirmSaveModal = true;
    this.confirmSave();
  }

  confirmSave(): void {
    this.showConfirmSaveModal = false;
    this.isSaving = true;

    const formData = new FormData();
    formData.append('titre_projet', this.currentProject.titre_projet);
    formData.append('descript_projet', this.currentProject.descript_projet);
    formData.append('tbl_niveau_id', this.currentProject.tbl_niveau_id);
    formData.append('tbl_categorie_id', this.currentProject.tbl_categorie_id);
    formData.append('user_id', this.currentProject.user_id);
    formData.append('type', this.currentProject.type);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const finalize = () => this.isSaving = false;

    if (this.isEditMode) {
      formData.append('_method', 'PUT');
      this.projetService.updateProjectWithFormData(this.currentProject.id, formData).subscribe({
        next: () => { this.loadProjects(); this.closeModal(); },
        error: () => finalize(),
        complete: () => finalize()
      });
    } else {
      this.projetService.addProject(formData).subscribe({
        next: () => { this.loadProjects(); this.closeModal(); },
        error: () => finalize(),
        complete: () => finalize()
      });
    }
  }

  openConfirmDelete(project: any): void {
    this.projectToDelete = project;
    this.showConfirmDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.projectToDelete) return;

    this.isDeleting = true;
    this.projetService.deleteProject(this.projectToDelete.id).subscribe({
      next: () => this.loadProjects(),
      error: () => this.isDeleting = false,
      complete: () => { this.isDeleting = false; this.cancelDelete(); }
    });
  }

  cancelDelete(): void {
    this.showConfirmDeleteModal = false;
    this.projectToDelete = null;
  }
}
