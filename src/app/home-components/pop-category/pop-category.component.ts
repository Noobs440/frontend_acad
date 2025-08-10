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
  selectedLevel = '';
  searchQuery = '';

  private baseUrl: string = 'http://localhost:8000';

  constructor(
    private acceuilService: AcceuilService,
    private facultyService: FacultyService,
    private filiereService: FiliereService,
    private niveauService: NiveauService,
    private rechercheService: RechercheService
  ) {}

  isLoading=false;

  ngOnInit(): void {
    this.isLoading=true
    this.acceuilService.getCategoriesWithProjectNumber().subscribe({
      next:(data)=>{
        this.data = data;
        this.applyFilters();
        this.isLoading=false;
      }
      ,error:(err)=>
      {
        this.isLoading=false;
      },complete:()=>{
        this.isLoading=false;
      }

    });

    this.facultyService.getFaculties().subscribe(faculties => {
      this.faculties = faculties;
    });

    this.filiereService.getFilieres().subscribe(filieres => {
      this.filieres = filieres;
    });

    this.niveauService.getNiveaux().subscribe(niveaux => {
      this.niveaux = niveaux;
    });
  }

  applyFilters() {
    this.filteredCategories = this.data;

    if (this.selectedFaculty) {
      this.filteredCategories = this.filteredCategories.filter(category => category.details.faculte === this.selectedFaculty);
    }

    if (this.selectedLevel) {
      this.filteredCategories = this.filteredCategories.filter(category => category.details.niveau === this.selectedLevel);
    }

    if (this.selectedDepartment) {
      this.filteredCategories = this.filteredCategories.filter(category => category.details.filiere === this.selectedDepartment);
    }

    if (this.searchQuery) {
      this.filteredCategories = this.filteredCategories.filter(category =>
        category.nom_cat.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        category.descript_cat.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

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

  clearFilters() {
    this.selectedFaculty = '';
    this.selectedLevel = '';
    this.selectedDepartment = '';
    this.searchQuery = '';
    this.applyFilters();
  }

  getFullImageUrl(imagePath: string): string {
    return `${this.baseUrl}${imagePath}`;
  }
}
