import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../../../shared/info-dialog/info-dialog.component';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjetstatusService } from '../../../services/projetstatus.service';
import { DocumentService } from '../../../services/document.service';
import { ProjetService } from '../../../services/projet.service';
import { CollaborateurService } from '../../../services/collaborateur.service';
import { UserManagementService } from '../../../services/user-management.service';

@Component({
  selector: 'app-detail-projet',
  templateUrl: './detail-projet.component.html',
  styleUrl: './detail-projet.component.css'
})
export class DetailProjetComponent {
  documents: any[] = [];
  collaborators: any[] = [];
  isLoadingCollaborators = false;
  showAddDocumentForm = false;
  newDocumentTitle = '';
  newDocumentLink = '';
  isAddingDocument = false;
  showAddCollaboratorForm = false;
  newCollaboratorEmail = '';
  newCollaboratorName = '';
  newCollaboratorUserId: number | null = null;
  userSuggestions: any[] = [];
  isAddingCollaborator = false;
  editingCollaboratorId: number | null = null;
  editingCollaboratorData: any = null;
  editingCollaboratorName = '';
  editingCollaboratorEmail = '';
  isUpdatingCollaborator = false;

  selectedProjectId!: number;
  selectedProjectTitle = '';
  projectStatus = '';
  projectImage = '';
  description = '';
  views = 0;
  author = '';
  category = '';
  level = '';
  type = '';
  date = '';
  rejection_reason = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private projetStatusService: ProjetstatusService,
    private projetService: ProjetService,
    private collaborateurService: CollaborateurService,
    private userService: UserManagementService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.selectedProjectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadProjectDetails();
    this.loadDocuments();
    this.loadCollaborators();
  }

  getFullDocumentUrl(lien_doc: string): string {
    if (!lien_doc) return '#';
    if (lien_doc.startsWith('http')) return lien_doc;
    if (lien_doc.startsWith('/public') || lien_doc.startsWith('public')) {
      return `https://dschangschoolhub.duckdns.org/${lien_doc.replace(/^\/+/, '')}`;
    }
    return `https://dschangschoolhub.duckdns.org/storage/${lien_doc.replace(/^\/+/, '')}`;
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) {
      return 'assets/img/default.png';
    }
    return imagePath.startsWith('http')
      ? imagePath
      : `https://dschangschoolhub.duckdns.org/${imagePath.replace(/^\/+/, '')}`;
  }

  loadProjectDetails(): void {
    this.projetService.getProjectById(this.selectedProjectId).subscribe({
      next: project => {
        this.selectedProjectTitle = project?.titre_projet || project?.title || 'Projet';
        this.projectStatus = project?.status || 'Pending';
        this.projectImage = project?.image || project?.lien_image || '';
        this.description = project?.descript_projet || project?.description || '';
        this.views = project?.views || 0;
        this.author = project?.user?.nom_user || project?.user?.nom || project?.user?.email || project?.auteur || '';
        this.category = project?.categorie?.nom_cat || project?.categorie?.titre || project?.nom_categorie || project?.categorie || '';
        this.level = project?.niveau?.code_niv || project?.niveau?.titre || project?.niveau || '';
        this.type = project?.type || '';
        this.date = project?.created_at || project?.date || '';
        this.rejection_reason = project?.rejection_reason || '';
      },
      error: error => {
        console.error('Erreur chargement detail projet:', error);
      }
    });
  }

  loadDocuments(): void {
    this.documentService.getDocumentsByProject(this.selectedProjectId).subscribe({
      next: response => this.documents = response || [],
      error: err => console.error('Erreur chargement documents:', err)
    });
  }

  loadCollaborators(): void {
    this.isLoadingCollaborators = true;
    this.collaborateurService.getCollaborateursByProject(this.selectedProjectId).subscribe({
      next: response => {
        this.collaborators = response || [];
        this.isLoadingCollaborators = false;
      },
      error: err => {
        console.error('Erreur chargement collaborateurs du projet:', err);
        this.collaborators = [];
        this.isLoadingCollaborators = false;
      }
    });
  }

  toggleAddDocumentForm(): void {
    this.showAddDocumentForm = !this.showAddDocumentForm;
  }

  addDocument(): void {
    if (!this.newDocumentTitle.trim() || !this.newDocumentLink.trim()) {
      alert('Le titre et le lien du document sont obligatoires.');
      return;
    }

    this.isAddingDocument = true;
    this.documents = [
      ...this.documents,
      {
        titre_doc: this.newDocumentTitle.trim(),
        nom_doc: this.newDocumentTitle.trim(),
        lien_doc: this.newDocumentLink.trim()
      }
    ];
    this.newDocumentTitle = '';
    this.newDocumentLink = '';
    this.showAddDocumentForm = false;
    this.isAddingDocument = false;
  }

  toggleAddCollaboratorForm(): void {
    this.showAddCollaboratorForm = !this.showAddCollaboratorForm;
    if (!this.showAddCollaboratorForm) {
      this.newCollaboratorEmail = '';
      this.newCollaboratorName = '';
      this.newCollaboratorUserId = null;
      this.userSuggestions = [];
    }
  }

  onNewCollaboratorEmailInput(): void {
    const email = this.newCollaboratorEmail?.trim();
    if (!email) {
      this.userSuggestions = [];
      this.newCollaboratorUserId = null;
      this.newCollaboratorName = '';
      return;
    }

    this.userService.searchUsersByEmail(email).subscribe({
      next: users => {
        this.userSuggestions = users || [];
        const exact = this.userSuggestions.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        if (exact) {
          this.selectSuggestedUser(exact);
        }
      },
      error: err => {
        console.error('Erreur recherche utilisateur:', err);
        this.userSuggestions = [];
      }
    });
  }

  selectSuggestedUser(user: any): void {
    this.newCollaboratorUserId = user?.id ?? null;
    this.newCollaboratorEmail = user?.email || '';
    this.newCollaboratorName = user?.nom_user || user?.nom || user?.name || '';
    this.userSuggestions = [];
  }

  addCollaborator(): void {
    if (!this.newCollaboratorUserId) {
      alert('Selectionnez un collaborateur existant avant d ajouter.');
      return;
    }

    this.isAddingCollaborator = true;
    const name = this.newCollaboratorName || this.newCollaboratorEmail;
    this.collaborateurService
      .addCollaborateur(name, this.newCollaboratorEmail, `${this.selectedProjectId}`, this.newCollaboratorUserId)
      .subscribe({
        next: () => {
          this.loadCollaborators();
          this.newCollaboratorEmail = '';
          this.newCollaboratorName = '';
          this.newCollaboratorUserId = null;
          this.userSuggestions = [];
          this.showAddCollaboratorForm = false;
        },
        error: err => {
          console.error('Erreur ajout collaborateur:', err);
          alert('Impossible d ajouter ce collaborateur.');
        },
        complete: () => {
          this.isAddingCollaborator = false;
        }
      });
  }

  toggleEditCollaborator(collab: any): void {
    if (this.editingCollaboratorId === collab.id) {
      this.editingCollaboratorId = null;
      this.editingCollaboratorData = null;
      this.editingCollaboratorName = '';
      this.editingCollaboratorEmail = '';
      return;
    }

    this.editingCollaboratorId = collab.id;
    this.editingCollaboratorData = collab;
    this.editingCollaboratorName = collab.nom_collab || collab.name || '';
    this.editingCollaboratorEmail = collab.email_collab || collab.email || '';
  }

  updateCollaborator(): void {
    if (!this.editingCollaboratorId || !this.editingCollaboratorData) return;

    if (!this.editingCollaboratorName.trim() || !this.editingCollaboratorEmail.trim()) {
      alert('Le nom et l email sont obligatoires.');
      return;
    }

    this.isUpdatingCollaborator = true;
    const tblProjetId = this.editingCollaboratorData?.tbl_projet_id || this.selectedProjectId;
    const userId = this.editingCollaboratorData?.user_id || this.editingCollaboratorData?.id || 0;

    this.collaborateurService
      .updateCollaborateur(
        this.editingCollaboratorId,
        this.editingCollaboratorName,
        this.editingCollaboratorEmail,
        tblProjetId,
        userId
      )
      .subscribe({
        next: () => {
          this.loadCollaborators();
          this.editingCollaboratorId = null;
          this.editingCollaboratorData = null;
          this.editingCollaboratorName = '';
          this.editingCollaboratorEmail = '';
        },
        error: err => {
          console.error('Erreur modification collaborateur:', err);
          alert('Impossible de modifier ce collaborateur.');
          this.isUpdatingCollaborator = false;
        },
        complete: () => {
          this.isUpdatingCollaborator = false;
        }
      });
  }

  removeCollaborator(id: number | string): void {
    if (!confirm('Confirmez-vous la suppression de ce collaborateur ?')) {
      return;
    }

    this.collaborateurService.deleteCollaborateur(id).subscribe({
      next: () => this.loadCollaborators(),
      error: err => {
        console.error('Erreur suppression collaborateur:', err);
        alert('Impossible de supprimer ce collaborateur.');
      }
    });
  }

  onValidate(): void {
    if (this.projectStatus !== 'Pending') {
      return;
    }

    const userConfirmed = confirm('Souhaitez-vous approuver ce projet ?');
    if (!userConfirmed) {
      return;
    }

    this.projetStatusService.approveProject(this.selectedProjectId, this.rejection_reason).subscribe({
      next: () => {
        alert(`Le projet a ete approuve et un email a ete envoye a ${this.author}.`);
        this.projectStatus = 'Approved';
      },
      error: err => {
        alert(`Le projet n'a pas ete approuve, erreur lors de l'envoi de l'email.`);
        console.error(err);
      }
    });
  }

  onDelete(): void {
    if (this.projectStatus !== 'Pending') {
      return;
    }

    const dialogRef = this.dialog.open(InfoDialogComponent, {
      width: '350px',
      data: { title: 'Confirmation', message: 'Souhaitez-vous rejeter ce projet ?' }
    });
    dialogRef.afterClosed().subscribe(userConfirmed => {
      if (userConfirmed) {
        // La logique de rejet avec motif reste portee par le dashboard admin.
      }
    });
  }

  onRestore(): void {
    if (this.projectStatus !== 'Approved' && this.projectStatus !== 'Rejected') {
      return;
    }

    const dialogRef = this.dialog.open(InfoDialogComponent, {
      width: '350px',
      data: { title: 'Confirmation', message: "Souhaitez-vous restaurer ce projet a l'etat d'attente ?" }
    });
    dialogRef.afterClosed().subscribe(userConfirmed => {
      if (!userConfirmed) {
        return;
      }

      this.projetStatusService.pendingProject(this.selectedProjectId, '').subscribe({
        next: () => {
          this.dialog.open(InfoDialogComponent, {
            width: '350px',
            data: { title: 'Succes', message: `Le projet a ete restaure et un email a ete envoye a ${this.author}.` }
          });
          this.projectStatus = 'Pending';
        },
        error: err => {
          this.dialog.open(InfoDialogComponent, {
            width: '350px',
            data: { title: 'Erreur', message: "Le projet n'a pas ete restaure. Verifiez l'etat de votre connexion." }
          });
          console.error(err);
        }
      });
    });
  }
}
