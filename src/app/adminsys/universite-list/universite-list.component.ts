import { Component, OnInit } from '@angular/core';
import { UniversityService } from '../../services/university.service';
import { normalizeString } from '../../utils/string-utils';

@Component({
  selector: 'app-universite-list',
  templateUrl: './universite-list.component.html',
  styleUrls: ['./universite-list.component.css']
})
export class UniversiteListComponent implements OnInit {

  universites: any[] = [];
  filteredUniversites: any[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  searchTerm = '';
  sortAsc = true;

  isModalOpen = false;
  isEditMode = false;
  isSaving: boolean = false;

  currentUniversite: any = {
    nom_univ: '',
    localite_univ: '',
    email_univ: '',
    boite_postale: ''
  };

  // Pour confirmation suppression
  showConfirmDeleteModal = false;
  univToDelete: any = null;

  // Pour confirmation sauvegarde modal
  showConfirmSaveModal = false;

  searchField: string = 'nom_univ';

  filters = {
    action: '',
    resource: '',
    changes: ''
  };

  emailError: string = '';

  constructor(private universityService: UniversityService) {}

  ngOnInit(): void {
    this.loadUniversites();
  }

  loadUniversites(): void {
    this.universityService.getUniversities().subscribe(data => {
      this.universites = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let temp = this.universites.filter(u =>
      u[this.searchField]?.toLowerCase().includes(this.searchTerm.toLowerCase())
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
    this.filteredUniversites = temp.slice(start, start + this.pageSize);
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
    this.currentUniversite = {
      nom_univ: '',
      localite_univ: '',
      email_univ: '',
      boite_postale: ''
    };
    this.isModalOpen = true;
  }

  openEditModal(univ: any): void {
    this.isEditMode = true;
    this.currentUniversite = { ...univ };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  // Demande confirmation avant sauvegarde
  saveUniversite(): void {
    this.emailError = '';
    if (
      !this.currentUniversite.nom_univ.trim() ||
      !this.currentUniversite.localite_univ.trim()
    ) {
      // On peut ajouter d'autres erreurs si besoin
      return;
    }
    // Contrôle du format email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.currentUniversite.email_univ)) {
      this.emailError = "Le format de l'email est invalide (ex: nom@domaine.com).";
      return;
    }
    this.showConfirmSaveModal = true;
  }

  // Confirmation enregistrer modal
  confirmSave(): void {
    this.showConfirmSaveModal = false;
    this.isSaving = true;
    const finalize = () => this.isSaving = false;
    if (this.isEditMode) {
      this.universityService.updateuniversity(
        this.currentUniversite.id,
        this.currentUniversite.nom_univ,
        this.currentUniversite.email_univ,
        this.currentUniversite.localite_univ,
        this.currentUniversite.boite_postale
      ).subscribe({
        next: () => { this.loadUniversites(); this.closeModal(); },
        error: () => finalize(),
        complete: () => finalize()
      });
    } else {
      this.universityService.adduniversity(
        this.currentUniversite.nom_univ,
        this.currentUniversite.email_univ,
        this.currentUniversite.localite_univ,
        this.currentUniversite.boite_postale
      ).subscribe({
        next: () => { this.loadUniversites(); this.closeModal(); },
        error: () => finalize(),
        complete: () => finalize()
      });
    }
  }

  cancelSave(): void {
    this.showConfirmSaveModal = false;
  }

  openConfirmDelete(univ: any): void {
    this.univToDelete = univ;
    this.showConfirmDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.univToDelete) {
      this.universityService.deleteuniversity(this.univToDelete.id)
        .subscribe(() => {
          this.loadUniversites();
        });
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.showConfirmDeleteModal = false;
    this.univToDelete = null;
  }

  getResourceLabel(log: any): string {
    return log.resource || 'Unknown';
  }

  getChanges(log: any): string {
    return log.changes || 'No changes';
  }
}
