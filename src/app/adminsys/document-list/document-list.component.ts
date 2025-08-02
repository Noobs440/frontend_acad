import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {

  documents: any[] = [];
  filteredDocuments: any[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  // Recherche et tri
  searchTerm = '';
  sortAsc = true;

  // Modale
  isModalOpen = false;
  isEditMode = false;
  currentDocument: any = {
    nom_doc: '',
    lien_doc: null,
    user_id: null,
    tbl_projet_id: null
  };
  selectedFile: File | null = null;

  constructor(private documentService: DocumentService) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.documentService.getDocuments().subscribe(data => {
      this.documents = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let temp = this.documents.filter(d =>
      d.nom_doc.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    temp.sort((a, b) => {
      return this.sortAsc
        ? a.nom_doc.localeCompare(b.nom_doc)
        : b.nom_doc.localeCompare(a.nom_doc);
    });

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

  // Modale

  openAddModal(): void {
    this.isEditMode = false;
    this.currentDocument = {
      nom_doc: '',
      lien_doc: null,
      user_id: null,
      tbl_projet_id: null
    };
    this.selectedFile = null;
    this.isModalOpen = true;
  }

  openEditModal(doc: any): void {
    this.isEditMode = true;
    this.currentDocument = { ...doc };
    this.selectedFile = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  saveDocument(): void {
    if (!this.currentDocument.nom_doc?.trim()) return;

    const formData = new FormData();
    formData.append('nom_doc', this.currentDocument.nom_doc);
    formData.append('user_id', this.currentDocument.user_id?.toString() || '');
    formData.append('tbl_projet_id', this.currentDocument.tbl_projet_id?.toString() || '');

    if (this.selectedFile) {
      formData.append('lien_doc', this.selectedFile);
    }

    if (this.isEditMode) {
      // Add _method PUT for Laravel if needed
      formData.append('_method', 'PUT');
      this.documentService.updateDocumentMultipart(this.currentDocument.id, formData)
        .subscribe(() => {
          this.loadDocuments();
          this.closeModal();
        });
    } else {
      this.documentService.addDocumentMultipart(formData)
        .subscribe(() => {
          this.loadDocuments();
          this.closeModal();
        });
    }
  }

  deleteDocument(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.documentService.deleteDocument(id.toString()).subscribe(() => {
        this.loadDocuments();
      });
    }
  }
}
