import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SubmitPopupComponent } from '../user-components/submit-popup/submit-popup.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  onSearchButtonClick(): void {
  this.currentPage = 1;
  this.applyFilters();
  }

  projectStates: string[]  = ['Not Submitted', 'Pending', 'Approved', 'Rejected'];
  stateCounts: {[key:string]: number} = {};
  selectedStateFilter: string | null = null;

  token!: string | null;
  name!: string | null;
  role!: string | null;
  id!: string | null;
  projects: any[] = [];
  groupedProjects: { [key: string]: any[] } = {};
  selectedProject: any[] = [];
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;

  searchQuery: string = '';
  selectedTypeFilter: string = 'all';
  activeCommentProject: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private projectByIdService: ListingService,
    private userService: UserService
  ) {}
  collaboratorProjects: any[] = [];
  showCollabProjects: boolean = false;
  showStateProjects: string | null = null;

  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    this.role = localStorage.getItem('role');
    this.id = localStorage.getItem('id');

    // Always try to load user profile from backend for up-to-date name
    this.userService.getUserProfile().subscribe(profile => {
      if (profile && profile.nom_user) {
        this.name = profile.nom_user;
      } else {
        this.name = localStorage.getItem('name') || '';
      }
    });

    if (!this.token) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadProjects();
    this.loadCollaboratorProjects();
  }

  loadCollaboratorProjects() {
    if (!this.id) return;
    this.projectByIdService.getProjectsByCollaboratorId(this.id).subscribe({
      next: (data) => {
        // On ne garde que les projets où il n'est pas déjà créateur
        const userProjectIds = new Set(this.projects.map(p => p.id));
        this.collaboratorProjects = (data ?? []).filter((p: any) => !userProjectIds.has(p.id));
        // On fusionne pour l'affichage
        this.projects = this.projects.concat(this.collaboratorProjects);
        this.groupProjectsByStateAndDate();
        this.computeStateCounts();
        this.applyFilters();
      },
      error: () => {
        this.collaboratorProjects = [];
      }
    });
  }

  openCommentZone(project: any) {
    this.activeCommentProject = project;
  }

  closeCommentZone() {
    this.activeCommentProject = null;
  }

  loadProjects() {
    if (!this.id) return;

    this.projectByIdService.getProjectsById(this.id).subscribe({
      next: (data) => {
        this.projects = data ?? [];
        this.groupProjectsByStateAndDate();
        this.computeStateCounts();
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.projects = [];
        this.selectedProject = [];
        this.isLoading = false;
      }
    });
  }

  groupProjectsByStateAndDate() {
    this.groupedProjects = {};
    for (const state of this.projectStates) {
      let projectsOfState;
      if (state === 'Not Submitted') {
        projectsOfState = this.projects
          .filter((p: any) => p.status === 'Not Submitted')
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else {
        projectsOfState = this.projects
          .filter((p: any) => p.status === state)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      this.groupedProjects[state] = projectsOfState;
    }
  }

  computeStateCounts() {
    this.stateCounts = {};
    for (const state of this.projectStates) {
      if (state === 'Not Submitted') {
        this.stateCounts[state] = this.projects.filter((p: any) => p.status === 'Not Submitted').length;
      } else {
        this.stateCounts[state] = this.projects.filter((p: any) => p.status === state).length;
      }
    }
  }

  applyFilters(): void {
    const normalize = (str: string) =>
      str
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();

    const query = normalize(this.searchQuery.trim());
    let filtered: any[] = [];

    const searchFn = (project: any) => {
      return (
        (normalize(project.titre || '').includes(query) ||
         normalize(project.titre_projet || '').includes(query) ||
         normalize(project.type || '').includes(query) ||
         normalize(project.nom_categorie || '').includes(query) ||
         normalize(project.nom_utilisateur || '').includes(query)) &&
        (this.selectedTypeFilter === 'all' ||
         normalize(project.type || '') === normalize(this.selectedTypeFilter))
      );
    };

    if (this.selectedStateFilter) {
      filtered = (this.groupedProjects[this.selectedStateFilter] || []).filter(searchFn);
    } else {
      for (const state of this.projectStates) {
        const group = (this.groupedProjects[state] || []).filter(searchFn);
        filtered = filtered.concat(group);
      }
    }

    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.itemsPerPage));
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.updateDisplayedProjects(filtered);
  }

  onStateFilterChange(state: string) {
    this.showStateProjects = state;
    this.showCollabProjects = false;
    this.selectedStateFilter = state;
    this.currentPage = 1;
    this.applyFilters();
    setTimeout(() => this.scrollToProjectSection(), 75);
  }

  hideProjectList() {
    this.showCollabProjects = false;
    this.showStateProjects = null;
    this.selectedStateFilter = null;
    this.currentPage = 1;
    this.applyFilters();
  }

  updateDisplayedProjects(filteredProjects?: any[]): void {
    const projectsToPaginate = filteredProjects ?? this.projects;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.selectedProject = projectsToPaginate.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      if (this.showCollabProjects) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.selectedProject = this.collaboratorProjects.slice(startIndex, endIndex);
      } else if (this.showStateProjects) {
        const stateProjects = this.groupedProjects[this.showStateProjects] || [];
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.selectedProject = stateProjects.slice(startIndex, endIndex);
      } else {
        this.applyFilters();
      }
    }
  }

  onSearchQueryChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.searchQuery = input.value;
  this.currentPage = 1;
  this.applyFilters();
  }

  onTypeFilterChange(event: Event): void {
  const select = event.target as HTMLSelectElement;
  this.selectedTypeFilter = select.value;
  this.currentPage = 1;
  this.applyFilters();
  }



  getFullImageUrl(projectImage: string): string {
    if (!projectImage) return '';
    return projectImage.startsWith('http')
      ? projectImage
      : `https://uds-faculte-des-sciences.netlify.app/${projectImage.startsWith('/') ? '' : '/'}${projectImage}`;
  }

  openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.width = '95vw';
    dialogConfig.maxWidth = '420px';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.panelClass = 'submit-popup-panel';
    this.dialog.open(SubmitPopupComponent, dialogConfig);
  }

  onCollabCardClick() {
    this.showCollabProjects = !this.showCollabProjects;
    if (this.showCollabProjects) {
      this.showStateProjects = null;
      this.currentPage = 1;
      this.totalPages = Math.max(1, Math.ceil(this.collaboratorProjects.length / this.itemsPerPage));
      this.selectedProject = this.collaboratorProjects.slice(0, this.itemsPerPage);
      setTimeout(() => this.scrollToProjectSection(), 75);
    } else {
      this.applyFilters();
    }
  }

  private scrollToProjectSection(): void {
    if (typeof document === 'undefined') {
      return;
    }
    const target = document.getElementById('project-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
