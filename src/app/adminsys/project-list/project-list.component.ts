import { Component, OnInit } from '@angular/core';
import { ProjetService } from '../../services/projet.service';
import { normalizeString } from '../../utils/string-utils';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  projects: any[] = [];
  filteredProjects: any[] = [];
    niveaux: any[] = [];
  categories: any[] = [];
  utilisateurs: any[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  searchTerm = '';
  sortAsc = true;

  isModalOpen = false;
  isEditMode = false;
  currentProject: any = {
    titre_projet: '',
    descript_projet: '',
    tbl_niveau_id: '',
    tbl_categorie_id: '',
    user_id: '',
    type: 'Projet',
    soumis: false,
    status: 'Not Submitted',
    image: ''
  };

  selectedFile: File | null = null;

  // Confirmation modals
  showConfirmSaveModal = false;
  showConfirmDeleteModal = false;
  projectToDelete: any = null;

  // Spinner flags
  isSaving: boolean = false;
  isDeleting: boolean = false;

  filters = {
    action: '',
    resource: '',
    changes: ''
  };

  userSearch$ = new Subject<string>();

  constructor(private projetService: ProjetService) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadDropdowns();

    this.userSearch$.pipe(
      debounceTime(300),
      switchMap(term => term ? this.searchUsers(term) : of([]))
    ).subscribe(users => this.utilisateurs = users);
    
  }

  loadDropdowns(): void {
    this.projetService.getNiveaux().subscribe(n => this.niveaux = n);
    this.projetService.getCategories().subscribe(c => this.categories = c);
  }

onUserSearch(event: Event): void {
  const input = event.target as HTMLInputElement;
  const term = input.value;
  this.userSearch$.next(term);
}



  searchUsers(term: string) {
    return this.projetService.getSupervisedProjectsByEmail(term);
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  loadProjects(): void {
    this.projetService.getAllProjects().subscribe(data => {
      this.projects = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let temp = this.projects.filter(p =>
      p.titre_projet.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    // Apply search filters
    if (this.filters.action) {
      temp = temp.filter(log =>
        normalizeString(log.event).includes(normalizeString(this.filters.action))
      );
    }
    if (this.filters.resource) {
      temp = temp.filter(log =>
        normalizeString(this.getResourceLabel(log)).includes(normalizeString(this.filters.resource))
      );
    }
    if (this.filters.changes) {
      temp = temp.filter(log =>
        normalizeString(this.getChanges(log)).includes(normalizeString(this.filters.changes))
      );
    }

    temp.sort((a, b) => this.sortAsc
        ? a.titre_projet.localeCompare(b.titre_projet)
        : b.titre_projet.localeCompare(a.titre_projet)
    );

    this.totalPages = Math.ceil(temp.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;

    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredProjects = temp.slice(start, start + this.pageSize);
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

  openAddModal(): void {
    this.isEditMode = false;
    this.currentProject = {
      titre_projet: '',
      descript_projet: '',
      tbl_niveau_id: '',
      tbl_categorie_id: '',
      user_id: '',
      type: 'Projet',
      soumis: false,
      status: 'Not Submitted',
      image: ''
    };
    this.selectedFile = null;
    this.isModalOpen = true;
  }

  openEditModal(project: any): void {
    this.isEditMode = true;
    this.currentProject = { ...project };
    this.selectedFile = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveProject(): void {
    if (!this.currentProject.titre_projet.trim() || !this.currentProject.descript_projet.trim()) {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }
    this.showConfirmSaveModal = true;
  }

  confirmSave(): void {
    this.showConfirmSaveModal = false;
    this.isSaving = true;

    const formData = new FormData();
    formData.append('titre_projet', this.currentProject.titre_projet);
    formData.append('descript_projet', this.currentProject.descript_projet);
    formData.append('tbl_niveau_id', this.currentProject.tbl_niveau_id);
    formData.append('tbl_categorie_id', this.currentProject.tbl_categorie_id);
    formData.append('user_id', this.currentProject.user_id);
    formData.append('type', this.currentProject.type);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const finalize = () => this.isSaving = false;

    if (this.isEditMode) {
      formData.append('_method', 'PUT');
      this.projetService.updateProjectWithFormData(this.currentProject.id, formData).subscribe({
        next: () => { this.loadProjects(); this.closeModal(); },
        error: () => finalize(),
        complete: () => finalize()
      });
    } else {
      this.projetService.addProject(formData).subscribe({
        next: () => { this.loadProjects(); this.closeModal(); },
        error: () => finalize(),
        complete: () => finalize()
      });
    }
  }

  cancelSave(): void {
    this.showConfirmSaveModal = false;
  }

  openConfirmDelete(project: any): void {
    this.projectToDelete = project;
    this.showConfirmDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.projectToDelete) return;

    this.isDeleting = true;
    this.projetService.deleteProject(this.projectToDelete.id).subscribe({
      next: () => this.loadProjects(),
      error: () => this.isDeleting = false,
      complete: () => { this.isDeleting = false; this.cancelDelete(); }
    });
  }

  cancelDelete(): void {
    this.showConfirmDeleteModal = false;
    this.projectToDelete = null;
  }

  openDescriptionModal(description: string): void {
    alert(description);
  }

  getResourceLabel(log: any): string {
    return log.resource || 'Unknown';
  }

  getChanges(log: any): string {
    return log.changes || 'No changes';
  }
}
