import { Component, OnInit } from '@angular/core';
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
  token!: string | null;
  name!: string | null;
  role!: string | null;
  id!: string | null;

  projects: any[] = [];
  selectedProject: any[] = [];
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;

  searchQuery: string = '';
  selectedTypeFilter: string = 'all';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private projectByIdService: ListingService
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('role');
    this.id = localStorage.getItem('id');

    if (!this.token) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadProjects();
  }

  loadProjects() {
    if (!this.id) return;

    this.projectByIdService.getProjectsById(this.id).subscribe({
      next: (data) => {
        this.projects = data ?? [];
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

  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();

    const filtered = this.projects.filter(project => {
      const matchesSearch =
        project.titre?.toLowerCase().includes(query) ||
        project.type?.toLowerCase().includes(query);

      const matchesType =
        this.selectedTypeFilter === 'all' ||
        project.type?.toLowerCase() === this.selectedTypeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });

    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.itemsPerPage));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.currentPage = Math.max(this.currentPage, 1);

    this.updateDisplayedProjects(filtered);
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


    dialogConfig.disableClose = true;
    dialogConfig.width='400px';
    dialogConfig.height='620px';

    this.dialog.open(SubmitPopupComponent,dialogConfig );


  }

}
