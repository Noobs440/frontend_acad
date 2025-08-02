import { Component, OnInit } from '@angular/core';
import { FacultyService } from '../../services/faculty.service';

@Component({
  selector: 'app-faculty-list',
  templateUrl: './faculty-list.component.html',
  styleUrls: ['./faculty-list.component.css']
})
export class FacultyListComponent implements OnInit {

  faculties: any[] = [];
  filteredFaculties: any[] = [];

  searchTerm = '';
  sortAsc = true;

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  isModalOpen = false;
  isEditMode = false;
  currentFaculty: any = {
    nom_fac: '',
    email_fac: '',
    tbl_universite_id: ''
  };

  constructor(private facultyService: FacultyService) {}

  ngOnInit(): void {
    this.loadFaculties();
  }

  loadFaculties(): void {
    this.facultyService.getFaculties().subscribe(data => {
      this.faculties = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let temp = this.faculties.filter(f =>
      f.nom_fac.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    temp.sort((a, b) => {
      return this.sortAsc
        ? a.nom_fac.localeCompare(b.nom_fac)
        : b.nom_fac.localeCompare(a.nom_fac);
    });

    this.totalPages = Math.ceil(temp.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;

    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredFaculties = temp.slice(start, start + this.pageSize);
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
    this.currentFaculty = {
      nom_fac: '',
      email_fac: '',
      tbl_universite_id: ''
    };
    this.isModalOpen = true;
  }

  openEditModal(faculty: any): void {
    this.isEditMode = true;
    this.currentFaculty = { ...faculty };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveFaculty(): void {
    if (!this.currentFaculty.nom_fac.trim()) return;

    if (this.isEditMode) {
      this.facultyService.updateFaculty(
        this.currentFaculty.id,
        this.currentFaculty.nom_fac,
        this.currentFaculty.email_fac,
        this.currentFaculty.tbl_universite_id
      ).subscribe(() => {
        this.loadFaculties();
        this.closeModal();
      });
    } else {
      this.facultyService.addFaculty(
        this.currentFaculty.nom_fac,
        this.currentFaculty.email_fac,
        this.currentFaculty.tbl_universite_id
      ).subscribe(() => {
        this.loadFaculties();
        this.closeModal();
      });
    }
  }

  deleteFaculty(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.facultyService.deleteFaculty(id.toString())
        .subscribe(() => this.loadFaculties());
    }
  }
}
