import { Component, OnInit } from '@angular/core';
import { NiveauService } from '../../services/niveau.service';
import { normalizeString } from '../../utils/string-utils';

@Component({
  selector: 'app-niveau-list',
  templateUrl: './niveau-list.component.html',
  styleUrls: ['./niveau-list.component.css']
})
export class NiveauListComponent implements OnInit {

  niveaux: any[] = [];
  filteredNiveaux: any[] = [];

  searchTerm = '';
  sortAsc = true;

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  isModalOpen = false;
  isEditMode = false;
  currentNiveau: any = {
    code_niv: ''
  };

  // Pour modal confirmation suppression
  showConfirmDeleteModal = false;
  niveauToDelete: any = null;

  // Champ de recherche sélectionné
  searchField: string = 'code_niv';

  filters = {
    action: '',
    resource: '',
    changes: ''
  };

  constructor(private niveauService: NiveauService) {}

  ngOnInit(): void {
    this.loadNiveaux();
  }

  loadNiveaux(): void {
    this.niveauService.getNiveaux().subscribe(data => {
      this.niveaux = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let temp = this.niveaux.filter(n =>
      n[this.searchField]?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    temp.sort((a, b) => {
      return this.sortAsc
        ? a[this.searchField]?.localeCompare(b[this.searchField])
        : b[this.searchField]?.localeCompare(a[this.searchField]);
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
    this.filteredNiveaux = temp.slice(start, start + this.pageSize);
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
    this.currentNiveau = { code_niv: '' };
    this.isModalOpen = true;
  }

  openEditModal(niveau: any): void {
    this.isEditMode = true;
    this.currentNiveau = { ...niveau };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveNiveau(): void {
    if (!this.currentNiveau.code_niv.trim()) return;

    if (this.isEditMode) {
      this.niveauService.updateniveau(
        this.currentNiveau.id,
        this.currentNiveau.code_niv
      ).subscribe(() => {
        this.loadNiveaux();
        this.closeModal();
      });
    } else {
      this.niveauService.addniveau(this.currentNiveau.code_niv)
        .subscribe(() => {
          this.loadNiveaux();
          this.closeModal();
        });
    }
  }

  // Ouvre modal confirmation suppression
  openConfirmDelete(niveau: any): void {
    this.niveauToDelete = niveau;
    this.showConfirmDeleteModal = true;
  }

  // Confirme suppression
  confirmDelete(): void {
    if (this.niveauToDelete) {
      this.niveauService.deleteniveau(this.niveauToDelete.id.toString())
        .subscribe(() => {
          this.loadNiveaux();
          this.cancelDelete();
        });
    }
  }

  // Annule suppression
  cancelDelete(): void {
    this.showConfirmDeleteModal = false;
    this.niveauToDelete = null;
  }

  getResourceLabel(log: any): string {
    return log.resource || 'Unknown';
  }

  getChanges(log: any): string {
    return log.changes || 'No changes';
  }
}
