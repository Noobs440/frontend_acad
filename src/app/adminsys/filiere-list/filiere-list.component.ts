import { Component, OnInit } from '@angular/core';
import { FiliereService } from '../../services/filiere.service';
import { normalizeString } from '../../utils/string-utils';

@Component({
  selector: 'app-filiere-list',
  templateUrl: './filiere-list.component.html',
  styleUrls: ['./filiere-list.component.css']
})
export class FiliereListComponent implements OnInit {

  filieres: any[] = [];
  filteredFilieres: any[] = [];
  faculties: any[] = [];

  searchTerm = '';
  sortAsc = true;

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  isModalOpen = false;
  isEditMode = false;
  currentFiliere: any = {
    nom_fil: '',
    tbl_faculte_id: ''
  };

  // Modal confirmation suppression
  showConfirmDeleteModal = false;
  filiereToDelete: any = null;

  filters = {
    action: '',
    resource: '',
    changes: ''
  };

  isSaving: boolean = false;

  constructor(private filiereService: FiliereService) {}

  ngOnInit(): void {
    this.loadFilieres();
    this.loadFaculties();
  }

  loadFilieres(): void {
    this.filiereService.getFilieres().subscribe(data => {
      this.filieres = data;
      this.applyFilters();
    });
  }

  loadFaculties(): void {
    this.filiereService.getFaculties().subscribe(data => {
      this.faculties = data;
      this.applyFilters();
    });
  }

  getFacultyName(id: number): string {
    const fac = this.faculties.find(f => f.id === id);
    return fac ? fac.nom_fac : 'Faculté inconnue';
  }

  getResourceLabel(log: any): string {
    return log.resource || 'Unknown';
  }

  getChanges(log: any): string {
    return log.changes || 'No changes';
  }

  applyFilters(): void {
    let temp = this.filieres.filter(f =>
      f.nom_fil.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    temp.sort((a, b) => {
      return this.sortAsc
        ? a.nom_fil.localeCompare(b.nom_fil)
        : b.nom_fil.localeCompare(a.nom_fil);
    });

    // Apply search filters
    if (this.filters.action) {
      temp = temp.filter(log =>
        normalizeString(log.event).includes(normalizeString(this.filters.action))
      );
    }
    if (this.filters.resource) {
      temp = temp.filter(log =>
        normalizeString(this.getResourceLabel(log)).includes(normalizeString(this.filters.resource))
      );
    }
    if (this.filters.changes) {
      temp = temp.filter(log =>
        normalizeString(this.getChanges(log)).includes(normalizeString(this.filters.changes))
      );
    }

    // Apply pagination
    this.totalPages = Math.ceil(temp.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;

    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredFilieres = temp.slice(start, start + this.pageSize);
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
    this.currentFiliere = {
      nom_fil: '',
      tbl_faculte_id: ''
    };
    this.isModalOpen = true;
  }

  openEditModal(filiere: any): void {
    this.isEditMode = true;
    this.currentFiliere = { ...filiere };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveFiliere(): void {
    if (!this.currentFiliere.nom_fil?.trim() || !this.currentFiliere.tbl_faculte_id) return;
    this.isSaving = true;
    const finalize = () => this.isSaving = false;
    if (this.isEditMode) {
      this.filiereService.updateFiliere(
        this.currentFiliere.id,
        this.currentFiliere.nom_fil,
        this.currentFiliere.tbl_faculte_id
      ).subscribe({
        next: () => { this.loadFilieres(); this.closeModal(); },
        error: () => finalize(),
        complete: () => finalize()
      });
    } else {
      this.filiereService.addFiliere(
        this.currentFiliere.nom_fil,
        this.currentFiliere.tbl_faculte_id
      ).subscribe({
        next: () => { this.loadFilieres(); this.closeModal(); },
        error: () => finalize(),
        complete: () => finalize()
      });
    }
  }

  openConfirmDelete(filiere: any): void {
    this.filiereToDelete = filiere;
    this.showConfirmDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.filiereToDelete) {
      this.filiereService.deleteFiliere(this.filiereToDelete.id.toString())
        .subscribe(() => {
          this.loadFilieres();
          this.cancelDelete();
        });
    }
  }

  cancelDelete(): void {
    this.showConfirmDeleteModal = false;
    this.filiereToDelete = null;
  }
}
