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
  universities: any[] = [];

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

  // Modal suppression
  showConfirmDeleteModal = false;
  facultyToDelete: any = null;

  searchField: string = 'nom_fac';

  constructor(private facultyService: FacultyService) {}

  ngOnInit(): void {
    this.loadFaculties();
    this.loadUniversities();
  }

  loadFaculties(): void {
    this.facultyService.getFaculties().subscribe(data => {
      this.faculties = data;
      this.applyFilters();
    });
  }

  loadUniversities(): void {
    this.facultyService.getUniversities().subscribe(data => {
      this.universities = data;
    });
  }

  getUniversityName(id: number): string {
    const uni = this.universities.find(u => u.id === id);
    return uni ? uni.nom_univ : 'Université inconnue';
  }

  applyFilters(): void {
    let temp = this.faculties.filter(f =>
      f[this.searchField]?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    // Apply search filters
    if (this.searchTerm) {
      temp = temp.filter(faculty =>
        faculty.nom_fac.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        faculty.email_fac.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getUniversityName(faculty.tbl_universite_id).toLowerCase().includes(this.searchTerm.toLowerCase())
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

  openConfirmDelete(faculty: any): void {
    this.facultyToDelete = faculty;
    this.showConfirmDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.facultyToDelete) {
      this.facultyService.deleteFaculty(this.facultyToDelete.id.toString())
        .subscribe(() => {
          this.loadFaculties();
          this.cancelDelete();
        });
    }
  }

  cancelDelete(): void {
    this.showConfirmDeleteModal = false;
    this.facultyToDelete = null;
  }
}
