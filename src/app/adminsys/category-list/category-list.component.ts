import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {

  categories: any[] = [];
  filteredCategories: any[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  searchTerm = '';
  sortAsc = true;

  isModalOpen = false;
  isEditMode = false;
  currentCategory: any = { nom_cat: '', descript_cat: '', icone: '' };

  selectedFile: File | null = null;

  // Confirmation suppression
  isDeleteConfirmOpen = false;
  categoryToDeleteId: number | null = null;

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let temp = this.categories.filter(c =>
      c.nom_cat.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    temp.sort((a, b) => {
      return this.sortAsc
        ? a.nom_cat.localeCompare(b.nom_cat)
        : b.nom_cat.localeCompare(a.nom_cat);
    });

    this.totalPages = Math.ceil(temp.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;

    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredCategories = temp.slice(start, start + this.pageSize);
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
    this.currentCategory = { nom_cat: '', descript_cat: '', icone: '' };
    this.selectedFile = null;
    this.isModalOpen = true;
  }

  openEditModal(category: any): void {
    this.isEditMode = true;
    this.currentCategory = { ...category };
    this.selectedFile = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveCategory(): void {
    if (!this.currentCategory.nom_cat?.trim() || !this.currentCategory.descript_cat?.trim()) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const formData = new FormData();
    formData.append('nom_cat', this.currentCategory.nom_cat);
    formData.append('descript_cat', this.currentCategory.descript_cat);

    if (this.selectedFile) {
      formData.append('icone', this.selectedFile);
    }

    if (this.isEditMode) {
      this.categoryService.updateCategoryMultipart(this.currentCategory.id, formData)
        .subscribe(() => {
          this.loadCategories();
          this.closeModal();
          this.selectedFile = null;
        });
    } else {
      this.categoryService.addCategoryMultipart(formData)
        .subscribe(() => {
          this.loadCategories();
          this.closeModal();
          this.selectedFile = null;
        });
    }
  }

  openDeleteConfirm(id: number): void {
    this.categoryToDeleteId = id;
    this.isDeleteConfirmOpen = true;
  }

  cancelDelete(): void {
    this.categoryToDeleteId = null;
    this.isDeleteConfirmOpen = false;
  }

  confirmDelete(): void {
    if (this.categoryToDeleteId !== null) {
      this.categoryService.deleteCategory(this.categoryToDeleteId.toString())
        .subscribe(() => {
          this.loadCategories();
          this.cancelDelete();
        });
    }
  }
}
