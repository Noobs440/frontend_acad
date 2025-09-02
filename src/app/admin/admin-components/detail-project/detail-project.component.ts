 
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { InfoDialogComponent } from '../../../shared/info-dialog/info-dialog.component';
import { CollaborateurService } from '../../../services/collaborateur.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { ProjetService } from '../../../services/projet.service';
import { ProjetstatusService } from '../../../services/projetstatus.service';
import { Router } from '@angular/router';
import { DocumentService } from '../../../services/document.service';

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
  description!: string;
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
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.selectedProjectId = +this.route.snapshot.paramMap.get('id')!;
    this.reloadProject();
  }

  reloadProject() {
    this.projetService.getProjectById(this.selectedProjectId).subscribe({
      next: (project: any) => {
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
      }
    });
    this.documentService.getDocumentsByProject(this.selectedProjectId).subscribe(response => {
      this.documents = response;
    });
    this.collaborateurService.getCollaborateursByProject(this.selectedProjectId).subscribe(response => {
      this.collaborators = response;
    });
    this.actionCellRenderer();
  }



  showRejectModal = false;
  rejectReason: string = '';
  rejectError: boolean = false;

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
    this.projetStatusService.rejectProject(this.selectedProjectId, this.rejectReason).subscribe({
      next: value => {
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
      },
      complete: () => {
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


  getFullImageUrl(projectImage: string): string {
    if (!projectImage) {
      return '';
    }
    return projectImage.startsWith('http') ? projectImage : `http://localhost:8000/${projectImage.replace(/^\/+/, '')}`;
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
          this.projetStatusService.approveProject(this.selectedProjectId).subscribe({
            next: value => {
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
            },
            complete: () => {
              this.router.navigate(['/admin']);
            }
          });
        }
      });
    }
  }



  onRestore():void{
    if (this.projectStatus === "Approved" || this.projectStatus === "Rejected") {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmation',
          message: "Souhaitez-vous restaurer ce projet à l'état d'attente ?"
        }
      });
      dialogRef.afterClosed().subscribe(userConfirmed => {
        if (userConfirmed) {
          this.projetStatusService.pendingProject(this.selectedProjectId).subscribe({
            next: value => {
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
            },
            complete: () => {
              this.router.navigate(['/admin']);
            }
          });
        }
      });
    }
  }

   getRejectionReason(): string {
    return this.rejection_reason && this.rejection_reason.trim() !== '' ? this.rejection_reason : 'Aucun motif fourni.';
  }
}
