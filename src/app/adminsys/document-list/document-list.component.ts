import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { ProjetService } from '../../services/projet.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { InfoDialogComponent } from '../../shared/info-dialog/info-dialog.component';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {

  documents: any[] = [];
  filteredDocuments: any[] = [];

  projects: any[] = []; // Tous les projets pour autocomplete
  filteredProjectsList: any[] = [];
  projectSearchTerm = '';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  // Recherche et tri
  searchTerm = '';
  sortAsc = true;
  searchField: string = 'nom_doc';

  // Modale
  isModalOpen = false;
  isEditMode = false;
  currentDocument: any = {
    nom_doc: '',
    lien_doc: null,
    user_id: null,
    tbl_projet_id: null,
    projectTitle: ''
  };
  selectedFile: File | null = null;
  isSaving: boolean = false;

  constructor(private documentService: DocumentService, private projetService: ProjetService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadDocuments();
    this.loadProjects();
  }

  loadDocuments(): void {
    this.documentService.getDocuments().subscribe(data => {
      this.documents = data;
      this.applyFilters();
    });
  }

  loadProjects(): void {
    this.projetService.getAllProjects().subscribe(data => {
      this.projects = data;
    });
  }

  applyFilters(): void {
    let temp = this.documents.filter(d =>
      d[this.searchField]?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    temp.sort((a, b) => this.sortAsc
      ? a[this.searchField]?.localeCompare(b[this.searchField])
      : b[this.searchField]?.localeCompare(a[this.searchField])
    );

    this.totalPages = Math.ceil(temp.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;

    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredDocuments = temp.slice(start, start + this.pageSize);
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

  // Modal

  openAddModal(): void {
    this.isEditMode = false;
    this.currentDocument = {
      nom_doc: '',
      lien_doc: null,
      user_id: null,
      tbl_projet_id: null,
      projectTitle: ''
    };
    this.selectedFile = null;
    this.isModalOpen = true;
  }

  openEditModal(doc: any): void {
    this.isEditMode = true;
    this.currentDocument = {
      ...doc,
      projectTitle: doc.projet?.titre_projet || ''
    };
    this.selectedFile = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onProjectSearch(): void {
    const term = this.projectSearchTerm.toLowerCase();
    this.filteredProjectsList = this.projects.filter(p =>
      p.titre_projet.toLowerCase().includes(term)
    );
  }

  selectProject(project: any): void {
    this.currentDocument.tbl_projet_id = project.id;
    this.currentDocument.projectTitle = project.titre_projet;
    this.filteredProjectsList = [];
  }

  saveDocument(): void {
    if (!this.currentDocument.nom_doc?.trim() || !this.currentDocument.tbl_projet_id) return;
    this.isSaving = true;
    const finalize = () => this.isSaving = false;
    const formData = new FormData();
    formData.append('nom_doc', this.currentDocument.nom_doc);
    formData.append('tbl_projet_id', this.currentDocument.tbl_projet_id.toString());
    if (this.selectedFile) {
      formData.append('document', this.selectedFile);
    }
    if (this.isEditMode) {
      formData.append('_method', 'PUT');
      this.documentService.updateDocumentMultipart(this.currentDocument.id, formData)
        .subscribe({
          next: () => { this.loadDocuments(); this.closeModal(); },
          error: () => finalize(),
          complete: () => finalize()
        });
    } else {
      this.documentService.addDocumentMultipart(formData)
        .subscribe({
          next: () => { this.loadDocuments(); this.closeModal(); },
          error: () => finalize(),
          complete: () => finalize()
        });
    }
  }

  deleteDocument(id: number): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { width: '380px', data: { title: 'Confirmation', message: 'Confirmer la suppression ?' } });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.documentService.deleteDocument(id.toString()).subscribe(() => {
          this.loadDocuments();
        });
      }
    });
  }

}
