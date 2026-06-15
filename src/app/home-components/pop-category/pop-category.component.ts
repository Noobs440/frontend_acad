import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AcceuilService } from '../../services/acceuil.service';
import { FacultyService } from '../../services/faculty.service';
import { FiliereService } from '../../services/filiere.service';
import { NiveauService } from '../../services/niveau.service';
import { RechercheService } from '../../services/recherche.service';

@Component({
  selector: 'app-pop-category',
  templateUrl: './pop-category.component.html',
  styleUrls: ['./pop-category.component.css'],
  animations: [
    trigger('fadeUp', [
      state('void', style({ opacity: 0, transform: 'translateY(200px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms ease-out')),
    ]),
  ],
})
export class PopCategoryComponent implements OnInit {
  searchText: string = '';
  applySearchFilter(): void {
    // Si la recherche est utilisée, les filtres sont désactivés
    if (this.searchText && this.searchText.trim() !== '') {
      this.selectedCategory = null;
      this.selectedLevel = null;
    }
    let filtered = this.data;
    if (this.searchText && this.searchText.trim() !== '') {
      const txt = this.searchText.trim().toLowerCase();
      filtered = filtered.filter((category: any) =>
        category.nom_cat.toLowerCase().includes(txt) ||
        category.descript_cat.toLowerCase().includes(txt)
      );
    }
    this.filteredCategories = filtered;
    this.chunkedCategories = this.chunkArray(this.filteredCategories, this.itemsPerPage);
    this.totalPages = this.chunkedCategories.length;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.goToPage(1);
    this.noResults = this.filteredCategories.length === 0;
  }


  // ...
  isLoggedIn = !!localStorage.getItem('token');
  bgColor = 'white';
  noResults = false;

  faculties: any[] = [];
  filieres: any[] = [];
  niveaux: any[] = [];
  categories: any[] = [];
  data: any[] = [];
  filteredCategories: any[] = [];
  chunkedCategories: any[][] = [];
  paginatedCategories: any[] = [];
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;
  pages: number[] = [];

  selectedFaculty = '';
  selectedDepartment = '';
  selectedCategory: string | null = null;
  selectedLevel: string | null = null;
  // ...

  private baseUrl: string = 'https://dschangschoolhub.duckdns.org';

  constructor(
    private acceuilService: AcceuilService,
    private facultyService: FacultyService,
    private filiereService: FiliereService,
    private niveauService: NiveauService,
    private rechercheService: RechercheService,
    private router: Router
  ) {}
  onCategoryClick(category: any): void {
    this.router.navigate(['/home/projects-listing'], { queryParams: { domaine: category.nom_cat } });
  }

  isLoading=false;

  ngOnInit(): void {
    // Charger les niveaux
    this.niveauService.getNiveaux().subscribe({
      next: (niveaux: any[]) => {
        this.niveaux = niveaux;
      },
      error: (_err: any) => {
        this.niveaux = [];
      }
    });
    this.isLoading = true;
    this.acceuilService.getCategoriesWithProjectNumber().subscribe({
      next: (data: any[]) => {
        this.data = data;
        this.categories = data;
        this.applyFilters();
  // ...
        this.isLoading = false;
      },
      error: (_err: any) => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });

  }

  applyFilters(): void {
    // Si un filtre est utilisé, la recherche est vidée
    if (this.selectedCategory || this.selectedLevel) {
      this.searchText = '';
    }
    let filtered = this.data;
    if (this.selectedCategory && this.selectedCategory !== null) {
      filtered = filtered.filter((category: any) => category.nom_cat === this.selectedCategory);
    }
    if (this.selectedLevel && this.selectedLevel !== null) {
      filtered = filtered.filter((category: any) => category.niveau === this.selectedLevel);
    }
    this.filteredCategories = filtered;
    this.chunkedCategories = this.chunkArray(this.filteredCategories, this.itemsPerPage);
    this.totalPages = this.chunkedCategories.length;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.goToPage(1);
    this.noResults = this.filteredCategories.length === 0;
  }

  chunkArray(arr: any[], chunkSize: number): any[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.paginatedCategories = this.chunkedCategories[pageNumber - 1] || [];
    }
  }

  clearFilters(): void {
    this.selectedCategory = null;
    this.selectedLevel = null;
    this.applyFilters();
  }

  getFullImageUrl(imagePath: string): string {
    return `${imagePath}`;
  }
}
