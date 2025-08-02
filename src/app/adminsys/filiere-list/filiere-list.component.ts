import { Component, OnInit } from '@angular/core';
import { FiliereService } from '../../services/filiere.service';

@Component({
  selector: 'app-filiere-list',
  templateUrl: './filiere-list.component.html',
  styleUrls: ['./filiere-list.component.css']
})
export class FiliereListComponent implements OnInit {

  filieres: any[] = [];
  filteredFilieres: any[] = [];

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

  constructor(private filiereService: FiliereService) {}

  ngOnInit(): void {
    this.loadFilieres();
  }

  loadFilieres(): void {
    this.filiereService.getFilieres().subscribe(data => {
      this.filieres = data;
      this.applyFilters();
    });
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
    if (!this.currentFiliere.nom_fil.trim()) return;

    if (this.isEditMode) {
      this.filiereService.updateFiliere(
        this.currentFiliere.id,
        this.currentFiliere.nom_fil,
        this.currentFiliere.tbl_faculte_id
      ).subscribe(() => {
        this.loadFilieres();
        this.closeModal();
      });
    } else {
      this.filiereService.addFiliere(
        this.currentFiliere.nom_fil,
        this.currentFiliere.tbl_faculte_id
      ).subscribe(() => {
        this.loadFilieres();
        this.closeModal();
      });
    }
  }

  deleteFiliere(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.filiereService.deleteFiliere(id.toString())
        .subscribe(() => this.loadFilieres());
    }
  }
}
