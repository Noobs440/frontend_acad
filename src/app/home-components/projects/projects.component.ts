
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
  showGlobalSearch: boolean = false;
  // Propriétés pour la recherche globale (zone du haut)
  globalSearchQuery: string = '';
  globalSearchResults: any[] = [];
  globalSearchLoading: boolean = false;
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
  niveauxFiltres: any[] = [];

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
    this.isLoading = true;
    // Lire le paramètre de query 'niveau' pour activer le filtre automatiquement
    this.route.queryParams.subscribe(params => {
      if (params['niveau']) {
        this.selectedNiveau = params['niveau'];
      }
      if (params['domaine']) {
        this.selectedDomain = params['domaine'];
      }
      // Charger les projets après avoir défini le filtre
      this.acceuilService.getProjectsByOrder().subscribe({
        next: (data) => {
          this.data = data;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    });

    this.categorieService.getCategories().subscribe(categories => {
      this.categories = categories;
    });

    this.filiereService.getFilieres().subscribe(filieres => {
      this.filieres = filieres;
    });

    this.niveauService.getNiveaux().subscribe(niveaux => {
      this.niveaux = niveaux;
      this.niveauxFiltres = niveaux;
    });

    // If search value is in localStorage, use it
    const storedSearch = localStorage.getItem('searchValue');
    if (storedSearch) {
      this.searchQuery = storedSearch;
      this.searchProjects();
      localStorage.removeItem('searchValue');
    }
    // Fermer la recherche globale sur navigation (optionnel)
    this.route.params.subscribe(() => { this.showGlobalSearch = false; });
  }
  triggerGlobalSearch() {
    if (!this.globalSearchQuery || this.globalSearchQuery.trim() === '') {
      this.globalSearchResults = [];
      return;
    }
    this.globalSearchLoading = true;
    this.rechercheService.searchProjects(this.globalSearchQuery).subscribe({
      next: (response) => {
        this.globalSearchResults = response.results || [];
        this.globalSearchLoading = false;
      },
      error: () => {
        this.globalSearchResults = [];
        this.globalSearchLoading = false;
      }
    });
  }

  // Fonction utilitaire pour supprimer les accents
  normalizeString(str: string): string {
    return str
      ? str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
      : '';
  }

  applyFilters() {
    // Si un filtre est utilisé, la recherche est vidée
    if (this.selectedFilliere || this.selectedNiveau || this.selectedDomain) {
      this.searchQuery = '';
    }
    // La liste des niveaux ne change jamais selon le département
    this.niveauxFiltres = this.niveaux;
    let filtered = this.data;
    if (this.selectedFilliere) {
      filtered = filtered.filter(post => post.filiere === this.selectedFilliere);
      // Si un niveau est sélectionné, ne garder que les projets du niveau ET du département
      if (this.selectedNiveau) {
        filtered = filtered.filter(post => post.niveau === this.selectedNiveau);
      }
    } else if (this.selectedNiveau) {
      filtered = filtered.filter(post => post.niveau === this.selectedNiveau);
    }
    if (this.selectedDomain) {
      filtered = filtered.filter(post => post.nom_categorie === this.selectedDomain);
    }
    this.filteredPosts = filtered;
    this.chunkedPosts = this.chunkArray(this.filteredPosts, this.itemsPerPage);
    this.totalPages = this.chunkedPosts.length;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.goToPage(1);
    this.noResults = this.filteredPosts.length === 0;
  }

  searchProjects() {
    // Si la recherche est utilisée, les filtres sont désactivés
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      this.selectedFilliere = '';
      this.selectedNiveau = '';
      this.selectedDomain = '';
    }
    this.rechercheService.searchProjects(this.searchQuery).subscribe(response => {
      // Filtrage local sur description et collaborateurs
      const query = this.normalizeString(this.searchQuery);
      let results = response.results || [];
  results = results.filter((post: any) => {
        // Recherche sur la description
        const descriptionMatch = (
          (post.descript_projet && this.normalizeString(post.descript_projet).includes(query)) ||
          (post.description && this.normalizeString(post.description).includes(query)) ||
          (post.descriptif && this.normalizeString(post.descriptif).includes(query)) ||
          (post.resume && this.normalizeString(post.resume).includes(query))
        );
        // Recherche sur les collaborateurs (tableau ou string)
        let collabMatch = false;
        if (post.collaborateurs && Array.isArray(post.collaborateurs)) {
          collabMatch = post.collaborateurs.some((c: any) => {
            if (typeof c === 'string') {
              return this.normalizeString(c).includes(query);
            } else if (c && c.nom) {
              return this.normalizeString(c.nom).includes(query);
            }
            return false;
          });
        } else if (post.collaborateurs && typeof post.collaborateurs === 'string') {
          collabMatch = this.normalizeString(post.collaborateurs).includes(query);
        }
        // Retourne uniquement si la description ou les collaborateurs correspondent
        return descriptionMatch || collabMatch;
      });
      this.filteredPosts = results;
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