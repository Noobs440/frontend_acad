import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjetstatusService } from '../../../services/projetstatus.service';
import { DocumentPopupComponent } from '../document-popup/document-popup.component';
import { MatDialog } from '@angular/material/dialog';
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
supervisors = [
  { id: 101, name: 'Adriene Sonfack', email: 'adrienesonfack@gmail.com' },
  { id: 102, name: 'Marie Martin', email: 'marie.martin@email.com' },
  { id: 103, name: 'Ali Ben', email: 'ali.ben@email.com' },
  { id: 104, name: 'Nouvel Enseignant', email: 'nouvel.enseignant@email.com' }
];
  selectedSupervisorId: number | null = null;
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  collaborators: any[] = [];
  documents: any[] = [];

  selectedProjectId = 0;
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
  ) {}

  fetchSupervisors() {
    this.userService.getSupervisors().subscribe({
      next: (supervisors: any[]) => {
        this.supervisors = supervisors;
      },
      error: err => {
        console.error('Erreur lors du chargement des superviseurs', err);
      }
    });
  }

  addSupervisorToProject(supervisorId: string) {
    if (!supervisorId) return;
    this.projetService.assignSupervisorToProject(this.id, supervisorId as string).subscribe({
      next: () => {
        this.openCompleteDialog('Superviseur assigné avec succès.');
      },
      error: err => {
        console.error("Erreur lors de l'assignation du superviseur", err);
        alert("Erreur lors de l'assignation du superviseur.");
      }
    });
  }

  ngOnInit(): void {
    this.nom_collab = localStorage.getItem('nom_collab');
    this.user_id = localStorage.getItem('id');
    this.user_role = localStorage.getItem('role');
    this.user_name = localStorage.getItem('name');
    this.user_token = localStorage.getItem('token');

    this.selectedProjectId = +this.route.snapshot.paramMap.get('id')!;

    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      this.selectedProjectTitle = params['title'];
      this.projectStatus = params['status'];
      this.projectImage = params['image'];
      this.description = params['description'];
      this.author = params['author'];
      this.category = params['category'];
      this.level = params['level'];
      this.type = params['type'];
      this.date = params['date'];
      this.views = params['views'];
      this.email = params['email'];
    });

    this.projetService.countViews(this.id).subscribe();

    this.documentService.getDocumentsByProject(this.id).subscribe(res => this.documents = res);
    this.collaborateurService.getCollaborateursByProject(this.id).subscribe(res => this.collaborators = res);

    // Charger la liste des superviseurs
    // this.fetchSupervisors();

    this.actionCellRenderer();
  }

  deleteProject(Projectid: any) {
    this.projetService.deleteProject(Projectid).subscribe({
      next: () => this.openCompleteDialog("Project deleted completely."),
      error: err => alert(err.status),
      complete: () => this.dialog.closeAll()
    });
  }

  openDocument(link: any) {
    window.open(`${link}`, '_blank', 'noopener,noreferrer');
  }

  submitProject() {
    if (!this.selectedSupervisorId) {
      alert("Veuillez choisir un superviseur avant de soumettre le projet !");
      return;
    }
    this.submitService.submitProject(this.id, this.selectedSupervisorId).subscribe({
      next: () => alert("Votre projet a été soumis"),
      error: err => alert("Votre projet doit contenir au moins un document"),
      complete: () => this.Submitted = true
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

  onClose(): void {
    this.dialog.closeAll();
  }

  getFullImageUrl(projectImage: string): string {
    if (!projectImage) return '';
    return projectImage.startsWith('http')
      ? projectImage
      : `http://localhost:8000${projectImage.startsWith('/') ? '' : '/'}${projectImage}`;
  }

  actionCellRenderer(): string {
    let status = this.projectStatus;
    let actionButtons = `<i class="view-button fas fa-eye text-primary" style="..."></i>`;

    if (status === 'Pending') {
      actionButtons += `<i class="fas fa-check text-success" style="..."></i>
                        <i class="fas fa-trash-alt text-danger" style="..."></i>`;
    } else if (status === 'Approved') {
      actionButtons += `<i class="fas fa-times text-danger" style="..."></i>`;
    }

    return actionButtons;
  }

  confirmDeleteDocument(document: any) {
    const confirmed = window.confirm(`Voulez-vous vraiment supprimer le document "${document.nom_doc}" ?`);
    if (confirmed) this.deleteDocumentByid(document.id);
  }

  deleteDocumentByid(id: string) {
    this.documentService.deleteDocument(id).subscribe({
      next: () => {
        this.documents = this.documents.filter(doc => doc.id !== id);
        this.openCompleteDialog("Votre document a été supprimé avec succès.");
      },
      error: err => {
        console.error("Erreur lors de la suppression", err);
        alert("Erreur lors de la suppression du document.");
      }
    });
  }

  confirmDeleteCollaborator(collaborator: any) {
    const confirmed = window.confirm(`Supprimer le collaborateur "${collaborator.nom_collab}" ?`);
    if (confirmed) this.deleteCollaboratorById(collaborator.id);
  }

  deleteCollaboratorById(id: string) {
    this.collaborateurService.deleteCollaborateur(id).subscribe({
      next: () => {
        this.collaborators = this.collaborators.filter(c => c.id !== id);
        this.openCompleteDialog("Le collaborateur a été supprimé avec succès.");
      },
      error: err => {
        console.error("Erreur suppression collaborateur", err);
        alert("Erreur lors de la suppression.");
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
}
