import { Component, OnInit } from '@angular/core';
import { NiveauService } from '../../services/niveau.service';

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
      n.code_niv.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    temp.sort((a, b) => {
      return this.sortAsc
        ? a.code_niv.localeCompare(b.code_niv)
        : b.code_niv.localeCompare(a.code_niv);
    });

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

  deleteNiveau(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.niveauService.deleteniveau(id.toString())
        .subscribe(() => this.loadNiveaux());
    }
  }
}
