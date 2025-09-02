import { Component, OnInit } from '@angular/core';
import { CollaborateurService } from '../../services/collaborateur.service';
import { ProjetService } from '../../services/projet.service';
import { UserManagementService } from '../../services/user-management.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { normalizeString } from '../../utils/string-utils';

@Component({
  selector: 'app-collaborator-list',
  templateUrl: './collaborator-list.component.html',
  styleUrls: ['./collaborator-list.component.css']
})
export class CollaboratorListComponent implements OnInit {

  collaborators: any[] = [];
  filteredCollaborators: any[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  searchTerm = '';
  sortAsc = true;
  searchField: string = 'nom_collab';

  isModalOpen = false;
  isEditMode = false;
  isSaving: boolean = false;
  currentCollaborator: any = {
    nom_collab: '',
    email_collab: '',
    tbl_projet_id: '',
    user_id: null
  };

  // Autocomplete
  emailSearch$ = new Subject<string>();
  projectSearch$ = new Subject<string>();
  userSuggestions: any[] = [];
  projectSuggestions: any[] = [];

  constructor(
    private collaborateurService: CollaborateurService,
    private userService: UserManagementService,
    private projetService: ProjetService
  ) {}

  ngOnInit(): void {
    this.loadCollaborators();
    this.setupAutocomplete();
  }

  loadCollaborators(): void {
    this.collaborateurService.getCollaborateurs().subscribe(data => {
      // Associer le projet à chaque collaborateur si non déjà fait
      this.collaborators = data.map(collab => {
        if (!collab.projet && collab.tbl_projet_id) {
          // Cherche le projet dans la liste des suggestions ou via le service
          this.projetService.getProjectById(collab.tbl_projet_id).subscribe(proj => {
            collab.projet = proj;
          });
        }
        return collab;
      });
      this.applyFilters();
    });
  }

  setupAutocomplete(): void {
    // Autocomplete email / nom utilisateur
    this.emailSearch$.pipe(
      debounceTime(300),
      switchMap(term => term ? this.userService.searchUsersByEmail(term) : of([]))
    ).subscribe(users => this.userSuggestions = users);

    // Autocomplete projet
    this.projectSearch$.pipe(
      debounceTime(300),
      switchMap(term => term ? this.projetService.searchProjectsByTitle(term) : of([]))
    ).subscribe(projects => this.projectSuggestions = projects);
  }

  onEmailSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.emailSearch$.next(input.value);
  }

  selectUser(user: any) {
    this.currentCollaborator.email_collab = user.email;
    this.currentCollaborator.nom_collab = user.nom;
    this.currentCollaborator.user_id = user.id;
    this.userSuggestions = [];
  }

  onProjectSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.projectSearch$.next(input.value);
  }

  selectProject(project: any) {
    this.currentCollaborator.tbl_projet_id = project.id;
    this.projectSuggestions = [];
  }

  applyFilters(): void {
    let temp = this.collaborators.filter(c =>
      c[this.searchField]?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    temp.sort((a, b) => this.sortAsc
      ? a[this.searchField]?.localeCompare(b[this.searchField])
      : b[this.searchField]?.localeCompare(a[this.searchField])
    );

    this.totalPages = Math.ceil(temp.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;

    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredCollaborators = temp.slice(start, start + this.pageSize);
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
    this.currentCollaborator = { nom_collab: '', email_collab: '', tbl_projet_id: '', user_id: null };
    this.isModalOpen = true;
  }

  openEditModal(collaborator: any): void {
    this.isEditMode = true;
    this.currentCollaborator = { ...collaborator };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.userSuggestions = [];
    this.projectSuggestions = [];
  }

  saveCollaborator(): void {
    if (!this.currentCollaborator.nom_collab.trim() || !this.currentCollaborator.email_collab.trim()) {
      alert("Le nom et l'email sont obligatoires.");
      return;
    }
    if (!this.currentCollaborator.user_id) {
      alert("Cet utilisateur n'existe pas.");
      return;
    }
    if (!this.currentCollaborator.tbl_projet_id) {
      alert("Veuillez sélectionner un projet valide.");
      return;
    }
    this.isSaving = true;
    const finalize = () => this.isSaving = false;
    if (this.isEditMode) {
      this.collaborateurService.updateCollaborateur(
        this.currentCollaborator.id,
        this.currentCollaborator.nom_collab,
        this.currentCollaborator.email_collab,
        this.currentCollaborator.tbl_projet_id,
        this.currentCollaborator.user_id
      ).subscribe({
        next: () => { this.loadCollaborators(); this.closeModal(); },
        error: () => finalize(),
        complete: () => finalize()
      });
    } else {
      this.collaborateurService.addCollaborateur(
        this.currentCollaborator.nom_collab,
        this.currentCollaborator.email_collab,
        this.currentCollaborator.tbl_projet_id,
        this.currentCollaborator.user_id
      ).subscribe({
        next: () => { this.loadCollaborators(); this.closeModal(); },
        error: () => finalize(),
        complete: () => finalize()
      });
    }
  }

  deleteCollaborator(id: string): void {
    if (confirm('Confirmer la suppression ?')) {
      this.collaborateurService.deleteCollaborateur(id).subscribe(() => this.loadCollaborators());
    }
  }
}
