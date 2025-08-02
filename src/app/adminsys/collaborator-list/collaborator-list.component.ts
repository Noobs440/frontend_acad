import { Component, OnInit } from '@angular/core';
import { CollaborateurService } from '../../services/collaborateur.service';

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

  // Recherche et tri
  searchTerm = '';
  sortAsc = true;

  // Modale
  isModalOpen = false;
  isEditMode = false;
  currentCollaborator: any = { nom_collab: '', email_collab: '', tbl_projet_id: '', user_id: '' };

  constructor(private collaborateurService: CollaborateurService) { }

  ngOnInit(): void {
    this.loadCollaborators();
  }

  loadCollaborators(): void {
    this.collaborateurService.getCollaborateurs().subscribe(data => {
      this.collaborators = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let temp = this.collaborators.filter(c =>
      c.nom_collab.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    temp.sort((a, b) => {
      return this.sortAsc
        ? a.nom_collab.localeCompare(b.nom_collab)
        : b.nom_collab.localeCompare(a.nom_collab);
    });

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

  // Modale
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
        this.currentCollaborator.user_id
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
}
