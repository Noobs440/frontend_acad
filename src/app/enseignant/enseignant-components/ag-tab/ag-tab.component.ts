import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { ProjetService } from '../../../services/projet.service';

@Component({
  selector: 'app-ag-tab',
  templateUrl: './ag-tab.component.html',
  styleUrls: ['./ag-tab.component.css']
})
export class AgTabComponent implements OnInit {
  constructor(private router: Router, private projetService: ProjetService) {}

  columnDefs: ColDef[] = [
    { headerName: 'SN', field: 'id', sortable: true, filter: true, flex: 1 },
    { headerName: 'Title', field: 'titre_projet', sortable: true, filter: true, flex: 4 },
    { headerName: 'Author', field: 'nom_utilisateur', sortable: true, filter: true },
    { headerName: 'Image', field: 'image', sortable: true, filter: true, cellRenderer: this.imageCellRenderer.bind(this) },
    { headerName: 'Status', field: 'status', sortable: true, cellRenderer: this.statusCellRenderer.bind(this) },
    { headerName: 'Action', field: 'action', filter: true, cellRenderer: this.actionCellRenderer.bind(this) }
  ];

  @Input() rowData: any[] = [];

  selectedProjectId: number | undefined;
  selectedProjectTitle: string | undefined;

  ngOnInit() {
    // Ne charge rien par défaut, le tableau reste vide tant que rien n'est transmis par l'Input
  }

  imageCellRenderer(params: any) {
    const imageUrl = `http://localhost:8000${params.value}`;
    return `<img src="${imageUrl}" alt="image" class="img-fluid" style="max-width: 100px; max-height: 100px;">`;
  }

  statusCellRenderer(params: any) {
    const statusClass = params.value === 'Approved' ? 'bg-success' :
                       params.value === 'Pending' ? 'bg-warning' :
                       'bg-danger';
    return `<span class="badge ${statusClass}">${params.value}</span>`;
  }

  actionCellRenderer(params: any) {
    const status = params.data.status;
    let actionButtons = `
      <i class="view-button fas fa-eye text-primary" style="border-radius: 50%; box-shadow: white; padding: 7px; font-size: 20px; background-color: #f6f6fe; cursor: pointer;"></i>
    `;

    if (status === 'Pending') {
      actionButtons += `
        <i class="approve-button fas fa-check text-success" style="border-radius: 50%; box-shadow: white; padding: 7px; font-size: 20px; background-color: #e0f8e9; cursor: pointer;"></i>
        <i class="reject-button fas fa-trash-alt text-danger" style="background-color: #ffecdf; border-radius: 50%; box-shadow: white; padding: 7px; font-size: 20px; cursor: pointer;"></i>
      `;
    } else if (status === 'Approved') {
      actionButtons += `
        <i class="reject-button fas fa-trash-alt text-danger" style="background-color: #ffecdf; border-radius: 50%; box-shadow: white; padding: 7px; font-size: 20px; cursor: pointer;"></i>
      `;
    }

    return actionButtons;
  }

  showDetail(params: any) {
    this.selectedProjectId = params.data.id; // Utilisation de l'ID du backend
    this.selectedProjectTitle = params.data.titre_projet;

    const queryParams = {
      title: params.data.titre_projet,
      status: params.data.status,
      image: params.data.image,
      description: params.data.descript_projet,
      views: params.data.views,
      author: params.data.nom_utilisateur,
      category: params.data.nom_categorie,
      level: params.data.niveau,
      type: params.data.type,
      date: params.data.created_at,
      email: params.data.email,
      id: params.data.id,
    };

    this.router.navigate(['/enseignant/dashboard/projet-detail', this.selectedProjectId], { queryParams });
  }

  updateProjectStatus(projectId: number, status: string) {
    this.projetService.updateProjectStatus(projectId, status).subscribe(response => {
      console.log('Statut mis à jour:', response);
      // Mettre à jour le statut dans rowData
      this.rowData = this.rowData.map(project => {
        if (project.id === projectId) {
          return { ...project, status };
        }
        return project;
      });
    });
  }

  onGridReady(params: any) {
    params.api.addEventListener('cellClicked', (event: any) => {
      const projectId = event.data.id;
      if (event.colDef.field === 'action') {
        if (event.event.target.classList.contains('view-button')) {
          this.showDetail(event);
        } else if (event.event.target.classList.contains('approve-button')) {
          this.updateProjectStatus(projectId, 'Approved');
        } else if (event.event.target.classList.contains('reject-button')) {
          this.updateProjectStatus(projectId, 'Rejected');
        }
      }
    });
  }
}
