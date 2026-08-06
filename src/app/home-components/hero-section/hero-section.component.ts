import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { Overlay, OverlayRef, ScrollDispatcher } from '@angular/cdk/overlay';
import { SearchbarService } from '../../services/searchbar.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AcceuilService } from '../../services/acceuil.service';
import { CategoryService } from '../../services/category.service';
import { ProjetService } from '../../services/projet.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css',
  animations: [
    trigger('fadeUp', [
      state('void', style({ opacity: 0, transform: 'translateY(200px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms ease-out')),
    ]),
  ],
})
export class HeroSectionComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;
  private overlayRef!: OverlayRef;
  private baseUrl: string = 'https://dschangschoolhub.ddns.net';

  chunkedCategories: any[] = [];
  categories_name: any = [];
  project_title: any = [];
  project_descript: any = [];
  project_images: any = [];
  project_author: any = [];
  project_date: any = [];
  data!: any[];
  data2!: any[];
  filteredProjects: any[] = [];
  filteredCategories: any[] = [];
  projets!: any[];
  categories!: any[];
  maxElements: number = 16;
  isLoading:boolean=false;

  icones : string[]=[
    'bai hugeicons--artificial-intelligence-02',
    'uil uil-shield-check',
    'bai icon-park-twotone--blockchain',
    'uil uil-wifi',
    'uil uil-graph-bar',
    'uil uil-desktop',
  ]

  constructor(private eRef: ElementRef,
              private overlay: Overlay,
              private scrollDispatcher: ScrollDispatcher,
              private acceuilService: AcceuilService,
              private categoryService: CategoryService,
              private projetService: ProjetService,
              private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.scrollDispatcher.scrolled().subscribe(() => {
      if (this.overlayRef) {
        this.overlayRef.updatePosition();
      }
    });

    this.acceuilService.getProjectsByOrder().subscribe({ next: (data) => {
        this.data = data;
        this.filteredProjects = data;
        this.isLoading=false;
      },
      error: (err) => {

        this.isLoading=false;
      },
      complete: () =>{
        this.isLoading=false;
      }
  });

    this.acceuilService.getCategoriesWithProjectNumber().subscribe(data2 => {
      this.data2 = data2;
      this.filteredCategories = data2;
      this.chunkPosts();
    });
  }

  searchService = inject(SearchbarService);

  overlayVisible = false;
  preventBlur = false;

  get searchValue() {
    return this.searchService.searchValue;
  }

  set searchValue(value: string) {
    this.searchService.searchValue = value;
    this.filterResults(value);
  }

  showOverlay() {
    this.overlayVisible = true;
  }

  hideOverlay() {
    if (!this.preventBlur) {
      this.overlayVisible = false;
    }
    this.preventBlur = false;
  }

  search(value: string) {
    this.preventBlur = true;
    this.searchValue = value;
    this.overlayVisible = false;
  }

  onSubmitSearch() {
    localStorage.setItem('searchValue', this.searchValue);
    this.router.navigate(['/home/projects-listing']);
  }


  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.overlayVisible = false;
    }
  }

  chunkPosts(): void {
    const chunkSize = 8;
    const limitedPosts = this.data2.slice(0, this.maxElements); // Limiter le nombre d'éléments
    for (let i = 0; i < limitedPosts.length; i += chunkSize) {
      this.chunkedCategories.push(limitedPosts.slice(i, i + chunkSize));
    }
  }

  getFullImageUrl(iconePath: string): string {
    return `${this.baseUrl}${iconePath}`;
  }

  // Fonction utilitaire pour supprimer les accents
  normalizeString(str: string): string {
    return str
      ? str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
      : '';
  }

  filterResults(query: string) {
    const normalizedQuery = this.normalizeString(query.trim());
    if (normalizedQuery === '') {
      this.filteredProjects = this.data;
      this.filteredCategories = this.data2;
      this.overlayVisible = false;
    } else {
      this.filteredProjects = this.data.filter(project => {
        const titreMatch = project.titre_projet && this.normalizeString(project.titre_projet).includes(normalizedQuery);
        const descriptionMatch = (project.descript_projet && this.normalizeString(project.descript_projet).includes(normalizedQuery)) || (project.description && this.normalizeString(project.description).includes(normalizedQuery));
        let collabMatch = false;
        if (project.collaborateurs && Array.isArray(project.collaborateurs)) {
          collabMatch = project.collaborateurs.some((c: any) => {
            if (typeof c === 'string') {
              return this.normalizeString(c).includes(normalizedQuery);
            } else if (c && c.nom) {
              return this.normalizeString(c.nom).includes(normalizedQuery);
            }
            return false;
          });
        } else if (project.collaborateurs && typeof project.collaborateurs === 'string') {
          collabMatch = this.normalizeString(project.collaborateurs).includes(normalizedQuery);
        }
        const domaineMatch = (project.domaine && this.normalizeString(project.domaine).includes(normalizedQuery)) || (project.domain && this.normalizeString(project.domain).includes(normalizedQuery));
        const categorieMatch = project.nom_categorie && this.normalizeString(project.nom_categorie).includes(normalizedQuery);
        return titreMatch || descriptionMatch || collabMatch || domaineMatch || categorieMatch;
      });
      this.filteredCategories = this.data2.filter(category =>
        this.normalizeString(category.nom_cat).includes(normalizedQuery)
      );
      this.overlayVisible = this.filteredProjects.length > 0 || this.filteredCategories.length > 0;
    }
  }
}
