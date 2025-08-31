import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NiveauService } from '../../services/niveau.service';
import { AcceuilService } from '../../services/acceuil.service';
import { RechercheService } from '../../services/recherche.service';

@Component({
  selector: 'app-levels-listing',
  templateUrl: './levels-listing.component.html',
  styleUrls: ['./levels-listing.component.css']
})
export class LevelsListingComponent implements OnInit {
  searchText: string = '';
  noResults: boolean = false;
  applySearchFilter(): void {
    // Si la recherche est utilisée, le filtre est désactivé
    if (this.searchText && this.searchText.trim() !== '') {
      this.selectedNiveau = null;
    }
    let filtered = this.projectsPerLevel;
    if (this.searchText && this.searchText.trim() !== '') {
      const txt = this.searchText.trim().toLowerCase();
      filtered = filtered.filter(lvl =>
        lvl.code_niv.toLowerCase().includes(txt) ||
        lvl.intitule_niv.toLowerCase().includes(txt) ||
        lvl.description.toLowerCase().includes(txt)
      );
    }
    this.noResults = filtered.length === 0;
    // Affiche uniquement le(s) niveau(x) trouvé(s), pas de pagination multiple
    this.totalPages = 1;
    this.pages = [1];
    this.currentPage = 1;
    this.paginatedLevels = filtered;
  }
  niveaux: any[] = [];
  projectsPerLevel: { code_niv: string, intitule_niv: string, count: number, description: string, icon: string }[] = [];
  paginatedLevels: { code_niv: string, intitule_niv: string, count: number, description: string, icon: string }[] = [];
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;
  pages: number[] = [];
  selectedNiveau: string | null = null;

  // Associer chaque niveau à une description et une icône
  levelMeta: { [key: string]: { description: string, icon: string } } = {
    'L1': { description: 'Licence 1ère année : découverte des bases.', icon: 'bi bi-book' },
    'L2': { description: 'Licence 2ème année : approfondissement.', icon: 'bi bi-journal-text' },
    'L3': { description: 'Licence 3ème année : préparation au diplôme.', icon: 'bi bi-mortarboard' },
    'M1': { description: 'Master 1 : spécialisation avancée.', icon: 'bi bi-award' },
    'M2': { description: 'Master 2 : expertise et mémoire.', icon: 'bi bi-lightbulb' },
    'D':  { description: 'Doctorat : recherche et innovation.', icon: 'bi bi-flask' },
  };

  constructor(
    private niveauService: NiveauService,
    private acceuilService: AcceuilService,
    private rechercheService: RechercheService,
    private router: Router
  ) {}
  onSearchBackend(): void {
    if (this.searchText && this.searchText.trim() !== '') {
      this.isLoading = true;
      this.rechercheService.searchProjects(this.searchText.trim()).subscribe({
        next: (results) => {
          this.paginatedLevels = Array.isArray(results) ? results : [];
          this.noResults = this.paginatedLevels.length === 0;
          this.isLoading = false;
        },
        error: () => {
          this.paginatedLevels = [];
          this.noResults = true;
          this.isLoading = false;
        }
      });
    }
  }
  onLevelClick(level: any): void {
    // Navigue vers l'onglet projets avec le niveau sélectionné en query param
    this.router.navigate(['/home/projects-listing'], { queryParams: { niveau: level.code_niv } });
  }

  ngOnInit(): void {
    this.isLoading = true;
    // Charger la liste des niveaux pour le filtre
    this.niveauService.getNiveaux().subscribe({
      next: (niveaux: any[]) => {
        this.niveaux = niveaux;
      },
      error: () => { this.niveaux = []; }
    });
    // Charger les niveaux avec le nombre de projets
    this.niveauService.getLevelsWithProjectCount().subscribe({
      next: (levels: any[]) => {
        this.projectsPerLevel = levels.map(lvl => ({
          code_niv: lvl.code_niv,
          intitule_niv: lvl.intitule_niv,
          count: lvl.projets_count || 0,
          description: this.levelMeta[lvl.code_niv]?.description || 'Niveau académique',
          icon: this.levelMeta[lvl.code_niv]?.icon || 'bi bi-collection',
        }));
        this.setupPagination();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  applyLevelFilter(): void {
    // Si le filtre est utilisé, la recherche est vidée
    if (this.selectedNiveau) {
      this.searchText = '';
    }
    let filtered = this.projectsPerLevel;
    if (this.selectedNiveau) {
      filtered = filtered.filter(lvl => lvl.code_niv === this.selectedNiveau);
    }
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage) || 1;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.currentPage = 1;
    this.paginatedLevels = filtered.slice(0, this.itemsPerPage);
  }

  setupPagination(): void {
    this.applyLevelFilter();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    let filtered = this.projectsPerLevel;
    if (this.selectedNiveau) {
      filtered = filtered.filter(lvl => lvl.code_niv === this.selectedNiveau);
    }
    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedLevels = filtered.slice(start, end);
  }

  prevPage(): void {
    if (this.currentPage > 1) this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1);
  }
}
