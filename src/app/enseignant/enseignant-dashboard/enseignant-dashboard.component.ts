import { Component, inject, Input } from '@angular/core';
import { ScriptLoaderService } from '../../services/script.service';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Router } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-enseignant-dashboard',
  templateUrl: './enseignant-dashboard.component.html',
  styleUrl: './enseignant-dashboard.component.css'
})
export class EnseignantDashboardComponent {
  constructor(private router:Router, private projetService:ProjetService){}

  projectStatus: ProjectStatus = {
    Approved: 0,
    Pending: 0,
    Rejected: 0
  };

  selectedProjectId!: number ;
  approvedProjects!: number;
  pendingProjects!: number;
  rejectedProjects!: number;
  selectedProjectTitle: string | null = null;
  showDetailProject: boolean = false;
  data: any[]=[];
  // ngOnInit(): void {
  //   this.scriptLoader.loadScript('assets/assets/js/main.js');
  // }


  ngOnInit() {
    // Récupère l'email du superviseur connecté
    const email = localStorage.getItem('email');
    if (email) {
      this.projetService.getSupervisedProjectsByEmail(email).subscribe((projects: any[]) => {
        // Mapping pour ag-grid
        this.rowData = projects.map((p: any, idx: number) => ({
          id: p.id,
          titre_projet: p.titre_projet,
          nom_utilisateur: p.nom_utilisateur || p.author || '',
          image: p.image || '',
          status: p.status || p.projectStatus || '',
          descript_projet: p.descript_projet || '',
          nom_categorie: p.nom_categorie || '',
          niveau: p.niveau || '',
          type: p.type || '',
          created_at: p.created_at || '',
          email: p.email || '',
          views: p.views || 0,
          action: ''
        }));
        this.filteredData = [...this.rowData];
        this.paginate(this.filteredData);
      });
    }

    // Statistiques (optionnel)
    this.projetService.countProjectsByStatus().subscribe((projets: any[]) => {
      this.data = projets;
      if (this.data && this.data.length > 0) {
        this.approvedProjects = this.data[0].Approved;
        this.pendingProjects = this.data[0].Pending;
        this.rejectedProjects = this.data[0].Rejected;
      }
    });
  }



  isSidebarCollapsed = true;

  rowSelection = 'single';

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  ngAfterViewInit() {
    const toggleButton = document.querySelector('.toggle-sidebar-btn');
    const sidebar = document.querySelector('.sidebar');

    if (toggleButton && sidebar) {
      toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }
  }
  getStatusClass(status: string) {
    return {
      'bg-success': status === 'Approved',
      'bg-warning': status === 'Pending',
      'bg-danger': status === 'Rejected'
    };
  }
  rowData: RowData[] = [];

  filteredData: RowData[] = [...this.rowData];
  paginatedData: RowData[] = [];
  currentPage = 1;
  rowsPerPage = 2;
  totalPages: number[] = [];


  renderActionButtons(status: string): string {
    let actionButtons = `
      <i  class="fas fa-eye text-primary" style="border-radius:50%; box-shadow:white; padding:7px; font-size:20px; background-color:#f6f6fe; cursor: pointer;"></i>
    `;

    if (status === 'Pending') {
      actionButtons += `
        <i class="fas fa-check text-success" style="border-radius:50%; box-shadow:white; padding:7px; font-size:20px; background-color:#e0f8e9; cursor: pointer;"></i>
        <i class="fas fa-trash-alt text-danger" style="background-color:#ffecdf; border-radius:50%; box-shadow:white; padding:7px; font-size:20px; cursor: pointer;"></i>
      `;
    } else if (status === 'Approved') {
      actionButtons += `
        <i class="fas fa-trash-alt text-danger" style="background-color:#ffecdf; border-radius:50%; box-shadow:white; padding:7px; font-size:20px; cursor: pointer;"></i>
      `;
    }

    return actionButtons;
  }

  sortTable(field: keyof RowData): void {
    const sortedData = [...this.filteredData].sort((a, b) => {
      const aValue = a[field] ?? '';
      const bValue = b[field] ?? '';
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });
    this.paginate(sortedData);
  }

  filterTable(status: string): void {
    this.filteredData = this.rowData.filter(row => status === '' || row.status === status);
    this.currentPage = 1;
    this.paginate(this.filteredData);
  }

  paginate(data: RowData[]): void {
    this.totalPages = Array.from({ length: Math.ceil(data.length / this.rowsPerPage) }, (_, i) => i + 1);
    this.changePage(this.currentPage, data);
  }

  changePage(page: number, data: RowData[] = this.filteredData): void {
    this.currentPage = page;
    const start = (page - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedData = data.slice(start, end);
  }
  showDetail(selectedRow: any) {
    this.selectedProjectId = selectedRow.sn;
    this.selectedProjectTitle = selectedRow.title;
    this.router.navigate(['/enseignant/dashboard/project-detail', this.selectedProjectId], { queryParams: { title: this.selectedProjectTitle } });
  }

}

interface ProjectStatus {
  Approved: number;
  Pending: number;
  Rejected: number;
}
interface RowData {
  id: number;
  titre_projet: string;
  nom_utilisateur: string;
  image: string;
  status: string;
  descript_projet?: string;
  nom_categorie?: string;
  niveau?: string;
  type?: string;
  created_at?: string;
  email?: string;
  views?: number;
  action?: string;
}
