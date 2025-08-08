
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
      // Filtrer les projets par état
      const projectsOfState = this.projects
        .filter((p: any) => p.status === state)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      this.groupedProjects[state] = projectsOfState;
    }
  }

  computeStateCounts() {
    this.stateCounts = {};
    for (const state of this.projectStates) {
      this.stateCounts[state] = this.projects.filter((p: any) => p.status === state).length;
    }
  }

  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    let filtered: any[] = [];
    // Si un état est sélectionné, ne montrer que ce groupe, sinon tous les groupes concaténés
    if (this.selectedStateFilter) {
      filtered = (this.groupedProjects[this.selectedStateFilter] || []).filter(project => {
        const matchesSearch =
          project.titre?.toLowerCase().includes(query) ||
          project.type?.toLowerCase().includes(query);
        const matchesType =
          this.selectedTypeFilter === 'all' ||
          project.type?.toLowerCase() === this.selectedTypeFilter.toLowerCase();
        return matchesSearch && matchesType;
      });
    } else {
      // Parcourir tous les groupes dans l'ordre des états
      for (const state of this.projectStates) {
        const group = (this.groupedProjects[state] || []).filter(project => {
          const matchesSearch =
            project.titre?.toLowerCase().includes(query) ||
            project.type?.toLowerCase().includes(query);
          const matchesType =
            this.selectedTypeFilter === 'all' ||
            project.type?.toLowerCase() === this.selectedTypeFilter.toLowerCase();
          return matchesSearch && matchesType;
        });
        filtered = filtered.concat(group);
      }
    }
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.itemsPerPage));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.currentPage = Math.max(this.currentPage, 1);
    this.updateDisplayedProjects(filtered);
  }

  onStateFilterChange(state: string) {
    if (this.selectedStateFilter === state) {
      this.selectedStateFilter = null; // toggle off
    } else {
      this.selectedStateFilter = state;
    }
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
      this.applyFilters();
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

  getProjectQueryParams(project: any) {
    return {
      id: project.id,
      user_id: project.user_id,
      title: project.titre,
      status: project.status,
      image: project.image,
      description: project.description,
      views: project.views,
      author: project.nom_utilisateur,
      category: project.nom_categorie,
      level: project.niveau,
      type: project.type,
      date: project.created_at,
      email: project.email
    };
  }

  getFullImageUrl(projectImage: string): string {
    if (!projectImage) return '';
    return projectImage.startsWith('http')
      ? projectImage
      : `http://localhost:8000${projectImage.startsWith('/') ? '' : '/'}${projectImage}`;
  }

  openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.width = '400px';
    dialogConfig.height = '620px';
    this.dialog.open(SubmitPopupComponent, dialogConfig);
  }

}
