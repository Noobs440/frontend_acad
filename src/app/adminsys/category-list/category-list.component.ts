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
  currentCategory: any = { nom_cat: '', descript_cat: '', icone:'' };

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

selectedFile: File | null = null;

onFileSelected(event: any): void {
  this.selectedFile = event.target.files[0];
  console.log('→ Fichier sélectionné :', this.selectedFile);
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

  // Modales
  openAddModal(): void {
    this.isEditMode = false;
    this.currentCategory = { nom_cat: '', descript_cat: '', icone:'' };
    this.isModalOpen = true;
  }

  openEditModal(category: any): void {
    this.isEditMode = true;
    this.currentCategory = { ...category };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

saveCategory(): void {
  console.log('→ Méthode saveCategory() déclenchée');
  console.log('→ currentCategory:', this.currentCategory);
  console.log('→ selectedFile:', this.selectedFile);

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



  deleteCategory(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.categoryService.deleteCategory(id.toString())
        .subscribe(() => {
          this.loadCategories();
        });
    }
  }
}
