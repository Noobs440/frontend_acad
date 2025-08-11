import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../../../shared/info-dialog/info-dialog.component';
import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjetstatusService } from '../../../services/projetstatus.service';
import { Router } from '@angular/router';
import { DocumentService } from '../../../services/document.service';
@Component({
  selector: 'app-detail-projet',
  templateUrl: './detail-projet.component.html',
  styleUrl: './detail-projet.component.css'
})
export class DetailProjetComponent {
  getFullDocumentUrl(lien_doc: string): string {
    if (!lien_doc) return '#';
    if (lien_doc.startsWith('http')) return lien_doc;
    if (lien_doc.startsWith('/public') || lien_doc.startsWith('public')) {
      return `http://localhost:8000/${lien_doc.replace(/^\/+/, '')}`;
    }
    return `http://localhost:8000/storage/${lien_doc.replace(/^\/+/, '')}`;
  }
  documents: any[]=[];

  selectedProjectId!: number;
  selectedProjectTitle!: string;
  projectStatus!:string;
  projectImage!:string;
  description!:string;
  views!:number;
  author!:string;
  category!:string;
  level!: string;
  type!:string;
  date!:string;
  email!:string;
  id!:number;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private projetStatusService: ProjetstatusService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {


     // Use only route param for id
     this.selectedProjectId = +this.route.snapshot.paramMap.get('id')!;
     this.id = this.selectedProjectId;
     // Fetch all project details from backend using id
     // Example: fetch project details and assign to component properties
     // this.projetService.getProjectById(this.id).subscribe(project => { ... });
     this.documentService.getDocumentsByProject(this.id).subscribe(response => {
      this.documents = response;
    });

     this.actionCellRenderer();
  }

  isExpanded = false;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }


  getFullImageUrl(imagePath: string): string {
    return `${'http://localhost:8000'}${imagePath}`;
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
    console.log('View action');
  }

  onValidate(): void {
    if (this.projectStatus === "Pending") {
      const userConfirmed = confirm("souhaitez vous approuver ce projet ? ");

      if (userConfirmed) {
        this.projetStatusService.approveProject(this.selectedProjectId).subscribe({
          next: value => {
            alert(`Le projet a été approuve et un email a été envoyé à ${this.author}, l'auteur du projet.`);
          },
          error: err => {
            alert(`Le projet n'a pas été approuve, erreur lors de l'envoi de l'email. Vérifiez l'état de votre connexion.`);
            console.error(err);
          },
          complete: () => {
            this.router.navigate(['/admin']);
            console.log("Succès");
          }
        });
      }
    }
  }


  onDelete(): void {
    if (this.projectStatus === "Pending") {
      const dialogRef = this.dialog.open(InfoDialogComponent, {
        width: '350px',
        data: { title: 'Confirmation', message: 'Souhaitez-vous rejeter ce projet ?' }
      });
      dialogRef.afterClosed().subscribe(userConfirmed => {
        if (userConfirmed) {
          // Ajoutez ici la logique de rejet du projet si besoin
        }
      });
    }
  }

  onRestore(): void {
    if (this.projectStatus === "Approved" || this.projectStatus === "Rejected") {
      const dialogRef = this.dialog.open(InfoDialogComponent, {
        width: '350px',
        data: { title: 'Confirmation', message: "Souhaitez-vous restaurer ce projet à l'état d'attente ?" }
      });
      dialogRef.afterClosed().subscribe(userConfirmed => {
        if (userConfirmed) {
          this.projetStatusService.pendingProject(this.selectedProjectId).subscribe({
            next: value => {
              this.dialog.open(InfoDialogComponent, {
                width: '350px',
                data: { title: 'Succès', message: `Le projet a été restauré et un email a été envoyé à ${this.author}, l'auteur du projet.` }
              });
            },
            error: err => {
              this.dialog.open(InfoDialogComponent, {
                width: '350px',
                data: { title: 'Erreur', message: `Le projet n'a pas été restauré, erreur lors de l'envoi de l'email. Vérifiez l'état de votre connexion.` }
              });
              console.error(err);
            },
            complete: () => {
              this.router.navigate(['/admin']);
              console.log("Succès");
            }
          });
        }
      });
    }
  }

}
