import { Component, Input, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AcceuilService } from './../../services/acceuil.service';
import { FiliereService } from '../../services/filiere.service';
import { NiveauService } from '../../services/niveau.service';
import { CategoryService } from '../../services/category.service';
import { RechercheService } from '../../services/recherche.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  animations: [
    trigger('fadeUp', [
      state('void', style({ opacity: 0, transform: 'translateY(200px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms ease-out')),
    ]),
  ],
})
export class ProjectsComponent implements OnInit {
  @Input() sectionClass: string = 'recent-posts section';
  @Input() bgColor: string = '#06BBCC';
  @Input() fColor: string = 'white';
  @Input() pad!: string;
  @Input() prevButtonColor: string = 'blue';
  @Input() nextButtonColor: string = '#000';

  private baseUrl: string = 'http://localhost:8000';
  data: any[] = [];
  categories: any[] = [];
  filieres: any[] = [];
  niveaux: any[] = [];

  filteredPosts: any[] = [];
  paginatedPosts: any[] = [];
  chunkedPosts: any[][] = [];
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;
  pages: any = [];
  noResults: boolean = false;

  selectedFilliere = '';
  selectedNiveau = '';
  selectedDomain = '';
  searchQuery = '';

  constructor(
    private categorieService: CategoryService,
    private niveauService: NiveauService,
    private filiereService: FiliereService,
    private acceuilService: AcceuilService,
    private rechercheService: RechercheService,
    private route: ActivatedRoute
  ) {}
  isLoading=false
  ngOnInit(): void {
    this.isLoading=true;
    this.acceuilService.getProjectsByOrder().subscribe({
      next:(data) => {
        this.data = data;
        this.applyFilters();
        this.isLoading=false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
      complete: ()=>{
        this.isLoading = false;
      }

    });

    this.categorieService.getCategories().subscribe(categories => {
      this.categories = categories;
    });

    this.filiereService.getFilieres().subscribe(filieres => {
      this.filieres = filieres;
    });

    this.niveauService.getNiveaux().subscribe(niveaux => {
      this.niveaux = niveaux;
    });


    // If search value is in localStorage, use it
    const storedSearch = localStorage.getItem('searchValue');
    if (storedSearch) {
      this.searchQuery = storedSearch;
      this.searchProjects();
      localStorage.removeItem('searchValue');
    }
  }


applyFilters() {
  this.filteredPosts = this.data;

  if (this.selectedFilliere) {
    this.filteredPosts = this.filteredPosts.filter(post => post.filiere === this.selectedFilliere);
  }

  if (this.selectedNiveau) {
    this.filteredPosts = this.filteredPosts.filter(post => post.niveau === this.selectedNiveau);
  }

  if (this.selectedDomain) {
    this.filteredPosts = this.filteredPosts.filter(post => post.nom_categorie === this.selectedDomain);
  }

  if (this.searchQuery) {
    // Fonction pour normaliser (enlever les accents et mettre en minuscule)
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const normalizedQuery = normalize(this.searchQuery);

    this.filteredPosts = this.filteredPosts.filter(post =>
      normalize(post.titre_projet).includes(normalizedQuery) ||
      normalize(post.nom_utilisateur).includes(normalizedQuery)
    );
  }

  this.chunkedPosts = this.chunkArray(this.filteredPosts, this.itemsPerPage);
  this.totalPages = this.chunkedPosts.length;
  this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  this.goToPage(1);
  this.noResults = this.filteredPosts.length === 0;
}
  searchProjects() {
    this.rechercheService.searchProjects(this.searchQuery).subscribe(response => {
      this.filteredPosts = response.results;
      this.chunkedPosts = this.chunkArray(this.filteredPosts, this.itemsPerPage);
      this.totalPages = this.chunkedPosts.length;
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      this.goToPage(1);
      this.noResults = this.filteredPosts.length === 0;
    });
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
      this.paginatedPosts = this.chunkedPosts[pageNumber - 1] || [];
    }
  }

  clearFilters() {
    this.selectedFilliere = '';
    this.selectedNiveau = '';
    this.selectedDomain = '';
    this.searchQuery = '';
    this.applyFilters();
  }

   getFullImageUrl(projectImage: string): string {
    if (!projectImage) {
      return '';
    }
    return projectImage.startsWith('http') ? projectImage : `http://localhost:8000/${projectImage.replace(/^\/+/, '')}`;
  }
}