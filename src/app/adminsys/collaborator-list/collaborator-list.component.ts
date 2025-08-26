import { Component, OnInit } from '@angular/core';
import { CollaborateurService } from '../../services/collaborateur.service';
import { ProjetService } from '../../services/projet.service';
import { UserManagementService } from '../../services/user-management.service';
import { normalizeString } from '../../utils/string-utils';

@Component({
  selector: 'app-collaborator-list',
  templateUrl: './collaborator-list.component.html',
  styleUrls: ['./collaborator-list.component.css']
})
export class CollaboratorListComponent implements OnInit {

  collaborators: any[] = [];
  filteredCollaborators: any[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  projects: any[] = [];
  users: any[] = [];

  // Recherche et tri
  searchTerm = '';
  sortAsc = true;
  searchField: string = 'nom_collab';

  // Modale
  isModalOpen = false;
  isEditMode = false;
  currentCollaborator: any = { nom_collab: '', email_collab: '', tbl_projet_id: '', user_id: '' };

  filters = {
    action: '',
    resource: '',
    changes: ''
  };

  constructor(
    private collaborateurService: CollaborateurService,
    private userService: UserManagementService,
    private projetService: ProjetService
  ) { }

  ngOnInit(): void {
    this.loadCollaborators();
    this.loadProjects();
    this.loadUsers();
  }

  loadCollaborators(): void {
    this.collaborateurService.getCollaborateurs().subscribe(data => {
      this.collaborators = data;
      this.applyFilters();
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      this.applyFilters();
    });
  }

  loadProjects(): void {
    this.projetService.getProjects().subscribe(data => {
      this.projects = data;
      this.applyFilters();
    });
  }

  getProjectName(id: number): string {
    const project = this.projects.find(p => p.id === id);
    return project ? project.titre_projet : 'Projet inconnu';
  }

  getUserName(id: number): string {
    const user = this.users.find(u => u.id === id);
    return user ? user.nom : 'Utilisateur inconnu';
  }

  applyFilters(): void {
    let temp = this.collaborators.filter(c =>
      c[this.searchField]?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    // Apply search filters
    if (this.searchTerm) {
      temp = temp.filter(log =>
        normalizeString(log.event).includes(normalizeString(this.searchTerm))
      );
    }

    temp.sort((a, b) => {
      return this.sortAsc
        ? a[this.searchField]?.localeCompare(b[this.searchField])
        : b[this.searchField]?.localeCompare(a[this.searchField]);
    });

    // Apply pagination
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
    this.currentCollaborator = { nom_collab: '', email_collab: '', tbl_projet_id: '', user_id: '' };
    this.isModalOpen = true;
  }

  openEditModal(collaborator: any): void {
    this.isEditMode = true;
    this.currentCollaborator = { ...collaborator };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveCollaborator(): void {
    if (!this.currentCollaborator.nom_collab.trim()) return;
    if (!this.currentCollaborator.email_collab.trim()) return;

    if (this.isEditMode) {
      this.collaborateurService.updateCollaborateur(
        this.currentCollaborator.id,
        this.currentCollaborator.nom_collab,
        this.currentCollaborator.email_collab,
        this.currentCollaborator.tbl_projet_id,
        this.currentCollaborator.user_id
      ).subscribe(() => {
        this.loadCollaborators();
        this.closeModal();
      });
    } else {
      this.collaborateurService.addCollaborateur(
        this.currentCollaborator.nom_collab,
        this.currentCollaborator.email_collab,
        this.currentCollaborator.tbl_projet_id,
        this.currentCollaborator.user_id || null
      ).subscribe(() => {
        this.loadCollaborators();
        this.closeModal();
      });
    }
  }

  deleteCollaborator(id: string): void {
    if (confirm('Confirmer la suppression ?')) {
      this.collaborateurService.deleteCollaborateur(id).subscribe(() => {
        this.loadCollaborators();
      });
    }
  }

  getResourceLabel(log: any): string {
    return log.resource || 'Unknown';
  }

  getChanges(log: any): string {
    return log.changes || 'No changes';
  }
}
