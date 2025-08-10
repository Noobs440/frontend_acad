import { Component, OnInit } from '@angular/core';
import { UniversityService } from '../../services/university.service';

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
      u.nom_univ.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    temp.sort((a, b) => {
      return this.sortAsc
        ? a.nom_univ.localeCompare(b.nom_univ)
        : b.nom_univ.localeCompare(a.nom_univ);
    });

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
    if (
      !this.currentUniversite.nom_univ.trim() ||
      !this.currentUniversite.localite_univ.trim()
    ) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    this.showConfirmSaveModal = true;
  }

  // Confirmation enregistrer modal
  confirmSave(): void {
    this.showConfirmSaveModal = false;
    if (this.isEditMode) {
      this.universityService.updateuniversity(
        this.currentUniversite.id,
        this.currentUniversite.nom_univ,
        this.currentUniversite.email_univ,
        this.currentUniversite.localite_univ,
        this.currentUniversite.boite_postale
      ).subscribe(() => {
        this.loadUniversites();
        this.closeModal();
      });
    } else {
      this.universityService.adduniversity(
        this.currentUniversite.nom_univ,
        this.currentUniversite.email_univ,
        this.currentUniversite.localite_univ,
        this.currentUniversite.boite_postale
      ).subscribe(() => {
        this.loadUniversites();
        this.closeModal();
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
}
