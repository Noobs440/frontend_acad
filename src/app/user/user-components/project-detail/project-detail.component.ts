import { ProjectHistoryService } from '../../../services/project-history.service';
  
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjetstatusService } from '../../../services/projetstatus.service';
import { DocumentPopupComponent } from '../document-popup/document-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../../../shared/info-dialog/info-dialog.component';
import { DocumentService } from '../../../services/document.service';
import { SubmitProjectService } from '../../../services/submit-project.service';
import { ProjetService } from '../../../services/projet.service';
import { CollaborateurService } from '../../../services/collaborateur.service';
import { CompleteDialogComponent } from '../complete-dialog/complete-dialog.component';
import { CollaborateurEditPopupComponent } from '../../collaborateur-edit-popup/collaborateur-edit-popup.component'
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  isDeletingCollaborator: string | null = null;
  isLoadingAddDocument = false;
  isLoadingAddCollaborator = false;
  isLoadingDelete = false;
  isLoadingResubmit = false;
  isLoadingDraft = false;
  isLoadingSubmit = false;
  isLoadingAssignAdmin = false;
  isTitleExpanded = false;
  isDescriptionExpanded = false;
  isMetaExpanded = false;
  isDocumentsExpanded = false;
  isCollaboratorsExpanded = false;
  admins: any[] = [];
  selectedAdminId: string | null = null;
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  collaborators: any[] = [];
  documents: any[] = [];

  selectedProjectId = 0;
  selectedProjectTitle = '';
  projectStatus = '';
  rejection_reason: string = '';
  projectImage = '';
  description = '';
  views = 0;
  author = '';
  category = '';
  level = '';
  type = '';
  date = '';
  email = '';
  id = 0;
  Submitted = false;
  nom_collab: any;
  email_collab: any;
  user_id: any;
  user_role: any;
  user_name: any;
  user_token: any;
  confirm_message = "";
  isExpanded = false;
  projectHistory: any[] = [];
  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private submitService: SubmitProjectService,
    private documentService: DocumentService,
    private collaborateurService: CollaborateurService,
    private projetService: ProjetService,
    private projetStatusService: ProjetstatusService,
    private userService: UserService,
    private projectHistoryService: ProjectHistoryService,
  ) {}

  fetchAdmins() {
    this.userService.getAdmins().subscribe({
      next: (admins: any[]) => {
        this.admins = admins;
      },
      error: err => {
        console.error('Erreur lors du chargement des admins', err);
      }
    });
  }

  addAdminToProject(adminId: string) {
    if (!adminId) return;
    this.projetService.assignAdminToProject(this.id, adminId).subscribe({
      next: () => {
        this.openCompleteDialog('Admin assigné avec succès.');
      },
      error: err => {
        console.error("Erreur lors de l'assignation de l'admin", err);
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Erreur', message: "Erreur lors de l'assignation de l'admin." }
        });
      }
    });
  }
  editDocument(document: any): void {
    const dialogRef = this.dialog.open(DocumentPopupComponent, {
      width: '400px',
      height: '550px',
      data: {
        formType: 'document',
        id: this.id ?? 0,
        user_id: this.user_id ?? 0,
        editMode: true,
        document: document
      }
    });
    dialogRef.afterClosed().subscribe((res: any) => {
      this.documentService.getDocumentsByProject(this.id ?? 0).subscribe((docs: any[]) => this.documents = docs);
    });
  }
  

  ngOnInit(): void {
    this.nom_collab = localStorage.getItem('nom_collab');
    this.user_id = localStorage.getItem('id');
    this.user_role = localStorage.getItem('role');
    this.user_token = localStorage.getItem('token');

    // Always try to load user profile from backend for up-to-date name
    this.userService.getUserProfile().subscribe(profile => {
      if (profile && profile.nom_user) {
        this.user_name = profile.nom_user;
      } else {
        this.user_name = localStorage.getItem('name') || '';
      }
    });

    // Récupérer l'ID du projet depuis l'URL
    this.selectedProjectId = +this.route.snapshot.paramMap.get('id')!;

    // Charger la liste des admins dès l'init
    this.fetchAdmins();

    // Charger les infos du projet depuis l'API pour garantir la cohérence des champs
    this.projetService.getProjectById(this.selectedProjectId).subscribe({
      next: (project: any) => {
        // Mapping strict selon la BDD/API Laravel
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
      },
      error: err => {
        console.error('Erreur lors du chargement du projet', err);
      }
    });

    // Charger les documents et collaborateurs liés au projet
    this.documentService.getDocumentsByProject(this.selectedProjectId).subscribe(res => this.documents = res);
    this.collaborateurService.getCollaborateursByProject(this.selectedProjectId).subscribe(res => this.collaborators = res);

    // Charger l'historique des modifications du projet
    this.projectHistoryService.getHistory(this.selectedProjectId).subscribe(history => {
      this.projectHistory = history;
    });
  }
// ...existing code...

  getRejectionReason(): string {
    return this.rejection_reason && this.rejection_reason.trim() !== '' ? this.rejection_reason : 'Aucun motif fourni.';
  }


  resubmitProject() {
    if (!this.selectedAdminId) {
      this.dialog.open(InfoDialogComponent, {
        width: '350px',
        data: { title: 'Attention', message: "Veuillez choisir un admin avant de resoumettre le projet !" }
      });
      return;
    }
    // On envoie le motif du rejet à l'admin lors de la resoumission
  // L'API actuelle n'accepte que l'id, donc on ne peut pas transmettre adminId et motif ici sans adapter le backend
  this.projetService.resubmitProject(this.id).subscribe({
      next: () => {
        this.projectStatus = 'Pending';
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Succès', message: 'Votre projet a été resoumis avec succès. Le motif du rejet a été transmis à l\'admin.' }
        });
        this.reloadProject();
      },
      error: err => {
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Erreur', message: "Erreur lors de la resoumission du projet." }
        });
        console.error(err);
      }
    });
  }

  saveAsDraft() {
    // Passe le projet à l'état 'Not Submitted' (brouillon)
    this.projetService.updateProjectStatus(this.id, 'Not Submitted').subscribe({
      next: () => {
        this.projectStatus = 'Not Submitted';
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Succès', message: 'Le projet a été enregistré comme brouillon (Non soumis).' }
        });
        this.reloadProject();
      },
      error: (err: any) => {
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Erreur', message: "Erreur lors de l'enregistrement du brouillon." }
        });
        console.error(err);
      }
    });
  }

  reloadProject() {
    this.projetService.getProjectById(this.id).subscribe({
      next: (project: any) => {
        this.projectStatus = project.status || '';
        this.rejection_reason = project.rejection_reason || '';
        this.selectedProjectTitle = project.titre_projet || '';
        this.projectImage = project.image || '';
        this.description = project.descript_projet || '';
        this.author = project.nom_user || (project.user && project.user.name) || '';
        this.category = project.tbl_categorie_id || '';
        this.level = project.tbl_niveau_id || '';
        this.type = project.type || '';
        this.date = project.created_at || '';
        this.views = project.views || 0;
        this.email = project.user?.email || '';
      }
    });
    this.documentService.getDocumentsByProject(this.id).subscribe(res => this.documents = res);
    this.collaborateurService.getCollaborateursByProject(this.id).subscribe(res => this.collaborators = res);
  }

  deleteProject(Projectid: any) {
    this.projetService.deleteProject(Projectid).subscribe({
      next: () => this.openCompleteDialog("Project deleted completely."),
      error: err => this.dialog.open(InfoDialogComponent, {
        width: '350px',
        data: { title: 'Erreur', message: err.status }
      }),
      complete: () => this.dialog.closeAll()
    });
  }

  openDocument(link: any) {
    window.open(`${link}`, '_blank', 'noopener,noreferrer');
  }

  submitProject() {
    if (!this.selectedAdminId) {
      this.dialog.open(InfoDialogComponent, {
        width: '350px',
        data: { title: 'Attention', message: "Veuillez choisir un admin avant de soumettre le projet !" }
      });
      return;
    }
    if (!this.documents || this.documents.length === 0) {
      this.dialog.open(InfoDialogComponent, {
        width: '350px',
        data: { title: 'Attention', message: "Vous devez ajouter au moins un document avant de soumettre le projet !" }
      });
      return;
    }
    // On assigne l'admin puis on soumet le projet (statut passera à Pending côté backend)
    this.projetService.assignAdminToProject(this.id, this.selectedAdminId).subscribe({
      next: () => {
        this.projetService.submitProject(this.id).subscribe({
          next: () => {
            this.dialog.open(InfoDialogComponent, {
              width: '350px',
              data: { title: 'Succès', message: "Votre projet a été soumis à l'admin choisi et passe en attente." }
            });
            this.Submitted = true;
            this.projectStatus = 'Pending';
          },
          error: (err) => {
            this.dialog.open(InfoDialogComponent, {
              width: '350px',
              data: { title: 'Erreur', message: err?.error?.message || "Erreur lors de la soumission du projet." }
            });
          }
        });
      },
      error: err => this.dialog.open(InfoDialogComponent, {
        width: '350px',
        data: { title: 'Erreur', message: "Erreur lors de l'assignation de l'admin." }
      })
    });
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  openDialog(formType: any) {
    const dialogRef = this.dialog.open(DocumentPopupComponent, {
      width: '400px',
      height: '550px',
      data: {
        formType,
        id: this.id,
        user_id: this.user_id
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.collaborateurService.getCollaborateursByProject(this.id).subscribe(res => this.collaborators = res);
    });
  }

  openDeleteDialog(templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef, {
      width: '350px',
      height: '200px',
      disableClose: false
    });
  }

  openCompleteDialog(message: string) {
    this.dialog.open(CompleteDialogComponent, {
      width: '350px',
      height: '200px',
      data: { message },
      disableClose: false
    });
  }

  deleteDocumentByid(id: string) {
    this.documentService.deleteDocument(id).subscribe({
      next: () => {
        this.documents = this.documents.filter(doc => doc.id !== id);
        this.openCompleteDialog("Votre document a été supprimé avec succès.");
      },
      error: err => {
        console.error("Erreur lors de la suppression", err);
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Erreur', message: "Erreur lors de la suppression du document." }
        });
      }
    });
  }

  confirmDeleteCollaborator(collaborator: any) {
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur
      data: {
        title: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer le collaborateur <b>${collaborator.nom_collab}</b> (<i>${collaborator.email_collab}</i>) ?<br><br><span style='color:red;font-weight:bold;'>Cette action est irréversible.</span>`,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        icon: 'warning',
        color: 'warn'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteCollaboratorById(collaborator.id);
      }
    });
  }

  deleteCollaboratorById(id: string) {
    this.isDeletingCollaborator = id;
    this.collaborateurService.deleteCollaborateur(id).subscribe({
      next: () => {
        this.collaborators = this.collaborators.filter(c => c.id !== id);
        this.openCompleteDialog("Le collaborateur a été supprimé avec succès.");
      },
      error: err => {
        console.error("Erreur suppression collaborateur", err);
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Erreur', message: "Erreur lors de la suppression." }
        });
      },
      complete: () => {
        this.isDeletingCollaborator = null;
      }
    });
  }

  editCollaborator(collaborator: any) {
    const dialogRef = this.dialog.open(DocumentPopupComponent, {
      width: '450px',
      data: {
        formType: 'collaborator',
        id: this.id,
        user_id: this.user_id,
        editMode: true,
        collaborator: collaborator
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.collaborateurService.getCollaborateursByProject(this.id).subscribe(res => {
        this.collaborators = res;
      });
    });
  }

  confirmDeleteDocument(document: any) {
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer le document <b>${document.nom_doc}</b> ?<br><br><span style='color:red;font-weight:bold;'>Cette action est irréversible.</span>`,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        icon: 'warning',
        color: 'warn'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteDocumentByid(document.id);
      }
    });
  }

  onClose(): void {
    this.dialog.closeAll();
  }

  getFullImageUrl(projectImage: string): string {
    if (!projectImage) return '';
    return projectImage.startsWith('http')
      ? projectImage
      : `http://localhost:8000${projectImage.startsWith('/') ? '' : '/'}${projectImage}`;
  }
  
}