import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjetstatusService } from '../../../services/projetstatus.service';
import { Router } from '@angular/router';
import { DocumentService } from '../../../services/document.service';

@Component({
  selector: 'app-detail-project',
  templateUrl: './detail-project.component.html',
  styleUrl: './detail-project.component.css'
})
export class DetailProjectComponent {
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
  constructor(private route: ActivatedRoute,private router:Router,private documentService:DocumentService, private projetStatusService:ProjetstatusService) {}

  ngOnInit(): void {

     // Accessing the route parameters
     this.selectedProjectId = +this.route.snapshot.paramMap.get('id')!;

     // Accessing the query parameters
     this.route.queryParams.subscribe(params => {
       this.id = params['id'];
       this.selectedProjectTitle = params['title'];
       this.projectStatus=params['status'];
       this.projectImage=params['image'];
       this.description=params['description']
       this.author=params['author']
       this.category=params['category'];
       this.level=params['level'];
       this.type=params['type'];
       this.date=params['date'];
       this.views=params['views'];
       this.email=params['email']
     });

     this.documentService.getDocumentsByProject(this.selectedProjectId).subscribe(response => {
      console.log('Documents reçus pour le projet', this.selectedProjectId, ':', response);
      this.documents = response;
    });

     this.actionCellRenderer();
  }

  isExpanded = false;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
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
      : `http://localhost:8000/storage/${lien_doc.replace(/^\/+/, '')}`;
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
      const userConfirmed = confirm("Souhaitez-vous rejeter ce projet ?");

      if (userConfirmed) {
        this.projetStatusService.rejectProject(this.selectedProjectId).subscribe({
          next: value => {
            alert(`Le projet a été rejeté et un email a été envoyé à ${this.author}, l'auteur du projet.`);
          },
          error: err => {
            alert(`Le projet n'a pas été rejeté, erreur lors de l'envoi de l'email. Vérifiez l'état de votre connexion.`);
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

  onRestore():void{
    if (this.projectStatus === "Approved" || this.projectStatus === "Rejected") {
      const userConfirmed = confirm("Souhaitez-vous restaure  ce projet a l'etat d'attente ?");

      if (userConfirmed) {
        this.projetStatusService.pendingProject(this.selectedProjectId).subscribe({
          next: value => {
            alert(`Le projet a été restaurer et un email a été envoyé à ${this.author}, l'auteur du projet.`);
          },
          error: err => {
            alert(`Le projet n'a pas été restaurer, erreur lors de l'envoi de l'email. Vérifiez l'état de votre connexion.`);
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

}
