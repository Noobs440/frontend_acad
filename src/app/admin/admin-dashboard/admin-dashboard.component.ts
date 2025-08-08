// Interface pour le typage des compteurs de projets par statut
interface ProjectStatus {
  Approved: number;
  Pending: number;
  Rejected: number;
}

// Interface pour le typage des projets affichés
interface RowData {
  sn: number;
  title: string;
  author: string;
  image: string;
  status: string;
  couleur_categorie?: string;
  nom_categorie?: string;
  created_at?: string;
  collaboratorsCount?: number;
}
// Interface pour le typage des compteurs de projets par statut
interface ProjectStatus {
  Approved: number;
  Pending: number;
  Rejected: number;
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { UserService } from '../../services/user.service';
import { CollaborateurService } from '../../services/collaborateur.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  adminId: any = null;
  projectStatus: ProjectStatus = {
    Approved: 0,
    Pending: 0,
    Rejected: 0
  };
  selectedProjectId!: number ;
  approvedProjects!: number;
  pendingProjects!: number;
  rejectedProjects!: number;
  selectedStatus: string | null = null;
  selectedProjectTitle: string | null = null;
  rowData: RowData[] = [];
  filteredData: RowData[] = [];
  paginatedData: RowData[] = [];
  currentPage = 1;
  rowsPerPage = 2;
  totalPages: number[] = [];
  isSidebarCollapsed = true;


  constructor(
    private router: Router,
    private projetService: ProjetService,
    private userService: UserService,
    private collaborateurService: CollaborateurService
  ) {}
  rowSelection = 'single';

  ngOnInit() {
    // Charger l'id de l'admin connecté
    this.userService.loadUserProfile();
    this.userService.getUserProfile().subscribe(users => {
      if (users && users.id) {
        this.adminId = users.id;
        this.loadAdminProjects();

    }
  });
  }

  onCardClick(status: string) {
    this.selectedStatus = status;
    this.filterTable(status);
  }

  hideProjectList() {
  this.selectedStatus = null;
  this.filteredData = [];
  this.paginatedData = [];
  this.loadAdminProjects();
}

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
      if (a[field] !== undefined && b[field] !== undefined) {
        if (a[field]! < b[field]!) return -1;
        if (a[field]! > b[field]!) return 1;
      }
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
    // Navigation vers le détail projet admin (sans queryParams, chemin cohérent)
    this.router.navigate(['/admin/project-detail', this.selectedProjectId]);
  }
// Recharge les projets de l'admin et le nombre de collaborateurs pour chaque projet
  loadAdminProjects() {
    this.projetService.getProjects().subscribe({
      next: (projects: any[]) => {
        const adminProjects = (projects || []).filter(p => String(p.admin_id) === String(this.adminId));
        // Pour chaque projet, charger le nombre de collaborateurs
        const mapped = adminProjects.map((p, idx) => {
          const author = p.user?.name || p.nom_user || p.auteur || '';
          return {
            sn: p.id,
            title: p.titre_projet || '',
            author,
            image: p.image || '',
            status: p.status || '',
            couleur_categorie: p.couleur_categorie,
            nom_categorie: p.nom_categorie,
            created_at: p.created_at,
            collaboratorsCount: 0 // sera mis à jour async
          };
        });
        this.rowData = mapped;
        this.filteredData = [...this.rowData];
        this.paginate(this.filteredData);
        // Mettre à jour les compteurs par statut pour l'admin
        this.approvedProjects = adminProjects.filter(p => p.status === 'Approved').length;
        this.pendingProjects = adminProjects.filter(p => p.status === 'Pending').length;
        this.rejectedProjects = adminProjects.filter(p => p.status === 'Rejected').length;
        // Charger le nombre de collaborateurs pour chaque projet
        this.rowData.forEach((row, idx) => {
          this.collaborateurService.getCollaborateursByProject(row.sn).subscribe(collabs => {
            this.rowData[idx].collaboratorsCount = collabs.length;
          });
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des projets admin:', err);
        this.rowData = [];
        this.filteredData = [];
        this.paginatedData = [];
        this.approvedProjects = 0;
        this.pendingProjects = 0;
        this.rejectedProjects = 0;
      }
    });
  }

  updateProjectStatus(projectId: number, newStatus: string): void {
    this.projetService.updateProjectStatus(projectId, newStatus).subscribe({
      next: () => {
        this.loadAdminProjects();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du status du projet:', err);
      }
    });
  }
}
