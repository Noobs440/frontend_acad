 
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { InfoDialogComponent } from '../../../shared/info-dialog/info-dialog.component';
import { CollaborateurService } from '../../../services/collaborateur.service';
import { UserManagementService } from '../../../services/user-management.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { ProjetService } from '../../../services/projet.service';
import { ProjetstatusService } from '../../../services/projetstatus.service';
import { Router } from '@angular/router';
import { DocumentService } from '../../../services/document.service';
import { forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-detail-project',
  templateUrl: './detail-project.component.html',
  styleUrls: ['./detail-project.component.css'],
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])
  ]
})
export class DetailProjectComponent {
  isTitleExpanded = false;
  isMetaExpanded = false;
  isLoadingRestore = false;
  isLoadingApprove = false;
  isLoadingReject = false;
  isDescriptionExpanded = false;
  documents: any[] = [];
  collaborators: any[] = [];
  selectedProjectId!: number;
  selectedProjectTitle!: string;
  projectStatus!: string;
  projectImage!: string;
  description: string = '';
  views!: number;
  author!: string;
  category!: string;
  level!: string;
  type!: string;
  date!: string;
  email!: string;
  id!: number;
  rejection_reason: string = '';
  isDocumentsExpanded = false;
  isCollaboratorsExpanded = false;
  // Add collaborator UI state
  showAddCollaboratorForm = false;
  newCollaboratorName = '';
  newCollaboratorEmail = '';
  newCollaboratorUserId: number | null = null;
  userSuggestions: any[] = [];
  isAddingCollaborator = false;
  isLoadingSearch = false;
  foundUser: any = null;
  isLoading = false;

  get showMoreDocuments(): boolean {
    return this.documents && this.documents.length > 1;
  }

  get showMoreCollaborators(): boolean {
    return this.collaborators && this.collaborators.length > 2;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private projetService: ProjetService,
    private projetStatusService: ProjetstatusService,
    private collaborateurService: CollaborateurService,
    private userService: UserManagementService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.selectedProjectId = +this.route.snapshot.paramMap.get('id')!;
    this.reloadProject();
  }

reloadProject() {
  this.isLoading = true;

  forkJoin({
    project: this.projetService.getProjectById(this.selectedProjectId),
    documents: this.documentService.getDocumentsByProject(this.selectedProjectId),
    collaborators: this.collaborateurService.getCollaborateursByProject(this.selectedProjectId)
  }).subscribe({
    next: ({ project, documents, collaborators }) => {
      // Projet
      this.id = project.id;
      this.selectedProjectTitle = project.titre_projet || '';
      this.projectStatus = project.status || '';
      this.projectImage = project.image || '';
      this.description = project.descript_projet || '';
      this.author = project.nom_user || (project.user && project.user.name) || '';
      this.category = project.tbl_categorie_id || '';
      this.level = project.tbl_niveau_id || '';
      this.type = project.type || '';
      this.date = project.created_at || '';
      this.views = project.views || 0;
      this.email = project.user?.email || '';
      this.rejection_reason = project.rejection_reason || '';

      // Documents & Collaborateurs
      this.documents = documents;
      this.collaborators = collaborators;

      this.actionCellRenderer();
    },
    error: () => {
      this.isLoading = false;
      this.dialog.open(InfoDialogComponent, {
        data: {
          title: 'Erreur',
          message: 'Impossible de charger les détails du projet. Vérifiez votre connexion.'
        }
      });
      this.router.navigate(['/admin']);
    },
    complete: () => {
      this.isLoading = false;
    }
  });
}



  showRejectModal = false;
  rejectReason: string = '';
  rejectError: boolean = false;

  // --- Modal de restauration ---
  showRestoreModal = false;
  restoreReason: string = '';
  restoreError: boolean = false;

  openRejectModal() {
    this.rejectReason = '';
    this.rejectError = false;
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.rejectError = false;
    this.rejectReason = '';
  }

confirmReject() {
  if (!this.rejectReason || this.rejectReason.trim().length === 0) {
    this.rejectError = true;
    return;
  }
  this.rejectError = false;
  this.showRejectModal = false;
  this.isLoadingReject = true;
  this.projetStatusService.rejectProject(this.selectedProjectId, this.rejectReason).subscribe({
    next: value => {
      // Émettre l'événement de changement
      this.projetService.notifyProjectChanged(this.selectedProjectId);
      this.dialog.open(InfoDialogComponent, {
        data: {
          title: 'Projet rejeté',
          message: `Le projet a été rejeté pour le motif: ${this.rejectReason}. Un email a été envoyé à ${this.author}, l'auteur du projet.`
        }
      });
      this.reloadProject();
    },
    error: err => {
      this.dialog.open(InfoDialogComponent, {
        data: {
          title: 'Erreur',
          message: `Le projet n'a pas été rejeté, erreur lors de l'envoi de l'email. Vérifiez l'état de votre connexion.`
        }
      });
      console.error(err);
      this.isLoadingReject = false;
    },
    complete: () => {
      this.isLoadingReject = false;
      this.router.navigate(['/admin']);
    }
  });
}

  // --- Gestion modal restauration ---
  openRestoreModal() {
    this.restoreReason = '';
    this.restoreError = false;
    this.showRestoreModal = true;
  }

  closeRestoreModal() {
    this.showRestoreModal = false;
    this.restoreError = false;
    this.restoreReason = '';
  }

  confirmRestore() {
    if (!this.restoreReason || this.restoreReason.trim().length === 0) {
      this.restoreError = true;
      return;
    }
    this.restoreError = false;
    this.showRestoreModal = false;
    this.isLoadingRestore = true;
    this.projetStatusService.pendingProject(this.selectedProjectId, this.restoreReason).subscribe({
      next: value => {
        this.projetService.notifyProjectChanged(this.selectedProjectId);
        this.dialog.open(InfoDialogComponent, {
          data: {
            title: 'Projet restauré',
            message: `Le projet a été restauré et un email a été envoyé à ${this.author}, l'auteur du projet.`
          }
        });
        this.reloadProject();
      },
      error: err => {
        this.dialog.open(InfoDialogComponent, {
          data: {
            title: 'Erreur',
            message: `Le projet n'a pas été restauré, erreur lors de l'envoi de l'email. Vérifiez l'état de votre connexion.`
          }
        });
        console.error(err);
        this.isLoadingRestore = false;
      },
      complete: () => {
        this.isLoadingRestore = false;
        this.router.navigate(['/admin']);
      }
    });
  }

  toggleDocumentsExpand() {
    this.isDocumentsExpanded = !this.isDocumentsExpanded;
  }

  toggleCollaboratorsExpand() {
    this.isCollaboratorsExpanded = !this.isCollaboratorsExpanded;
  }

  toggleAddCollaboratorForm(): void {
    this.showAddCollaboratorForm = !this.showAddCollaboratorForm;
    if (!this.showAddCollaboratorForm) {
      this.newCollaboratorName = '';
      this.newCollaboratorEmail = '';
      this.newCollaboratorUserId = null;
      this.userSuggestions = [];
      this.foundUser = null;
      this.isLoadingSearch = false;
    }
  }

  onNewCollaboratorEmailInput(): void {
    const email = this.newCollaboratorEmail?.trim();
    if (!email) {
      this.userSuggestions = [];
      this.foundUser = null;
      this.newCollaboratorUserId = null;
      this.newCollaboratorName = '';
      return;
    }

    this.isLoadingSearch = true;
    this.userService.searchUsersByEmail(email).subscribe({
      next: users => {
        this.userSuggestions = users || [];
        this.isLoadingSearch = false;

        // Si on trouve exactement l'email, le sélectionner automatiquement
        const exact = this.userSuggestions.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        if (exact) {
          this.selectSuggestedUser(exact);
        } else {
          this.foundUser = null;
          this.newCollaboratorName = '';
          this.newCollaboratorUserId = null;
        }
      },
      error: err => {
        console.error('Erreur recherche utilisateur:', err);
        this.userSuggestions = [];
        this.isLoadingSearch = false;
        this.foundUser = null;
        this.newCollaboratorName = '';
        this.newCollaboratorUserId = null;
      }
    });
  }

  selectSuggestedUser(user: any): void {
    this.foundUser = user;
    this.newCollaboratorUserId = user?.id ?? null;
    this.newCollaboratorEmail = user?.email || '';
    this.newCollaboratorName = user?.nom_user || user?.nom || user?.name || '';
    this.userSuggestions = [];
  }

  addCollaborator(): void {
    if (!this.foundUser) {
      alert('Veuillez sélectionner un utilisateur dans la liste de suggestions.');
      return;
    }
    
    if (!this.newCollaboratorUserId) {
      alert('Utilisateur introuvable. Veuillez le rechercher à nouveau.');
      return;
    }
    
    this.isAddingCollaborator = true;
    this.collaborateurService.addCollaborateur(this.newCollaboratorName.trim(), this.newCollaboratorEmail.trim(), `${this.selectedProjectId}`, this.newCollaboratorUserId).subscribe({
      next: () => {
        this.reloadProject();
        this.showAddCollaboratorForm = false;
        this.newCollaboratorName = '';
        this.newCollaboratorEmail = '';
        this.newCollaboratorUserId = null;
        this.userSuggestions = [];
        this.foundUser = null;
      },
      error: err => {
        console.error('Erreur ajout collaborateur:', err);
        alert('Impossible d\'ajouter le collaborateur. Vérifiez votre connexion.');
      },
      complete: () => {
        this.isAddingCollaborator = false;
      }
    });
  }

  removeCollaborator(collabId: number | string): void {
    if (!confirm('Confirmez-vous la suppression de ce collaborateur ?')) return;
    this.collaborateurService.deleteCollaborateur(collabId).subscribe({
      next: () => this.reloadProject(),
      error: err => {
        console.error('Erreur suppression collaborateur:', err);
        alert('Impossible de supprimer ce collaborateur.');
      }
    });
  }


  getFullImageUrl(projectImage: string): string {
    if (!projectImage) {
      return '';
    }
    return projectImage.startsWith('http') ? projectImage : `https://dschangschoolhub.duckdns.org/${projectImage.replace(/^\/+/, '')}`;
  }
  getFullDocumentUrl(lien_doc: string): string {
    if (!lien_doc) return '#';
    // Ajoute /storage/ devant le nom du fichier
    return lien_doc.startsWith('http')
      ? lien_doc
      : `/storage/${lien_doc.replace(/^\/+/, '')}`;
  }

  actionCellRenderer() {
    let status = this.projectStatus;
    let actionButtons = `
      <i class="view-button fas fa-eye text-primary" style="border-radius: 50%; box-shadow: white; padding: 7px; font-size: 20px; background-color: #f6f6fe; cursor: pointer;" "></i>
    `;

    if (status === 'Pending') {
      actionButtons += `
        <i class="fas fa-check text-success" style="border-radius: 50%; box-shadow: white; padding: 7px; font-size: 20px; background-color: #e0f8e9; cursor: pointer;"></i>
        <i class="fas fa-trash-alt text-danger" style="background-color: #ffecdf; border-radius: 50%; box-shadow: white; padding: 7px; font-size: 20px; cursor: pointer;"></i>
      `;
    } else if (status === 'Approved') {
      actionButtons += `
        <i class="fas fa-trash-alt text-danger" style="background-color: #ffecdf; border-radius: 50%; box-shadow: white; padding: 7px; font-size: 20px; cursor: pointer;"></i>
      `;
    }

    return actionButtons;
  }
  onView(): void {
  // Handle view action
  }

  onValidate(): void {
  if (this.projectStatus === "Pending") {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Souhaitez-vous approuver ce projet ?'
      }
    });
    dialogRef.afterClosed().subscribe(userConfirmed => {
      if (userConfirmed) {
        this.isLoadingApprove = true;
        this.projetStatusService.approveProject(this.selectedProjectId, this.rejection_reason).subscribe({
          next: value => {
            // Émettre l'événement de changement
            this.projetService.notifyProjectChanged(this.selectedProjectId);
            this.dialog.open(InfoDialogComponent, {
              data: {
                title: 'Projet approuvé',
                message: `Le projet a été approuvé et un email a été envoyé à ${this.author}, l'auteur du projet.`
              }
            });
            this.reloadProject();
          },
          error: err => {
            this.dialog.open(InfoDialogComponent, {
              data: {
                title: 'Erreur',
                message: `Le projet n'a pas été approuvé, erreur lors de l'envoi de l'email. Vérifiez l'état de votre connexion.`
              }
            });
            console.error(err);
            this.isLoadingApprove = false;
          },
          complete: () => {
            this.isLoadingApprove = false;
            this.router.navigate(['/admin']);
          }
        });
      }
    });
  }
}


  onRestore(): void {
    if (this.projectStatus === "Approved" || this.projectStatus === "Rejected") {
      this.openRestoreModal();
    }
  }
   getRejectionReason(): string {
    return this.rejection_reason && this.rejection_reason.trim() !== '' ? this.rejection_reason : 'Aucun motif fourni.';
  }
}
