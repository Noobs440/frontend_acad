
// Interfaces
interface ProjectStatus {
  Approved: number;
  Pending: number;
  Rejected: number;
}
interface RowData {
  sn: number;
  title: string;
  author: string;
  nom_utilisateur?: string;
  image: string;
  status: string;
  couleur_categorie?: string;
  nom_categorie?: string;
  created_at?: string;
  collaboratorsCount?: number;
}

// Imports
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { Router } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { UserService } from '../../services/user.service';
import { CollaborateurService } from '../../services/collaborateur.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  isDarkTheme = false;
  // ...autres propriétés...

  // Recherche de projets par titre ou auteur

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    this.updateThemeClass();
  }

  updateThemeClass() {
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
  // Listes uniques pour les filtres
  uniqueCategories: string[] = [];
  uniqueUsers: string[] = [];
  selectedYAxis: 'projects' | 'collaborators' = 'projects';
  // Système d'analyse croisée professionnel
  selectedXAxis: string = 'user';
  selectedStatusFilter: string = 'all';
  selectedCategoryFilter: string = 'all';
  selectedUserFilter: string = 'all';

  renderDynamicChart() {
    if (this.dynamicChart) {
      this.dynamicChart.destroy();
    }
    const ctx = (document.getElementById('dynamicChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;
    let labels: string[] = [];
    let data: number[] = [];
    let label = '';
    // Palette de couleurs harmonieuse (Material/Flat)
    const palette = [
      '#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b', '#ffa000', '#388e3c', '#303f9f',
      '#0097a7', '#cddc39', '#e64a19', '#512da8', '#00796b', '#f57c00', '#0288d1', '#c2185b', '#afb42b', '#5d4037'
    ];
    let color = palette[0];
    let bg = 'rgba(25, 118, 210, 0.12)';

    // Filtrage avancé
    let filtered = this.rowData;
    if (this.selectedStatusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.selectedStatusFilter);
    }
    if (this.selectedCategoryFilter !== 'all') {
      filtered = filtered.filter(p => p.nom_categorie === this.selectedCategoryFilter);
    }
    if (this.selectedUserFilter !== 'all') {
      filtered = filtered.filter(p => (p.author || p.nom_utilisateur) === this.selectedUserFilter);
    }

  if (this.selectedXAxis === 'user') {
      // Top utilisateurs par nombre de projets ou collaborateurs
      type YKey = 'projects' | 'collaborators';
      const userMap: { [user: string]: Record<YKey, number> } = {};
      filtered.forEach(row => {
        const user = row.author || row.nom_utilisateur || 'Inconnu';
        if (!userMap[user]) userMap[user] = { projects: 0, collaborators: 0 };
        userMap[user].projects++;
        userMap[user].collaborators += row.collaboratorsCount || 0;
      });
      const yKey: YKey = this.selectedYAxis;
      const sortedUsers = Object.entries(userMap).sort((a, b) => b[1][yKey] - a[1][yKey]).slice(0, 10);
      labels = sortedUsers.map(([user]) => user);
      data = sortedUsers.map(([, obj]) => obj[yKey]);
      label = yKey === 'projects' ? 'Nombre de projets' : 'Nombre de collaborateurs';
  color = palette[4];
  bg = 'rgba(123,31,162,0.12)';
  } else if (this.selectedXAxis === 'category') {
      // Top catégories par nombre de projets ou collaborateurs
      type YKey = 'projects' | 'collaborators';
      const catMap: { [cat: string]: Record<YKey, number> } = {};
      filtered.forEach(row => {
        const cat = row.nom_categorie || 'Inconnu';
        if (!catMap[cat]) catMap[cat] = { projects: 0, collaborators: 0 };
        catMap[cat].projects++;
        catMap[cat].collaborators += row.collaboratorsCount || 0;
      });
      const yKey: YKey = this.selectedYAxis;
      const sortedCats = Object.entries(catMap).sort((a, b) => b[1][yKey] - a[1][yKey]).slice(0, 10);
      labels = sortedCats.map(([cat]) => cat);
      data = sortedCats.map(([, obj]) => obj[yKey]);
      label = yKey === 'projects' ? 'Nombre de projets' : 'Nombre de collaborateurs';
  color = palette[1];
  bg = 'rgba(56,142,60,0.12)';
  } else if (this.selectedXAxis === 'month') {
    // Nombre de projets ou collaborateurs par mois
    const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    labels = monthLabels;
    data = Array(12).fill(0);
    const yKey: 'projects' | 'collaborators' = this.selectedYAxis;
    filtered.forEach(row => {
      if (row.created_at) {
        const d = new Date(row.created_at);
        const month = d.getMonth();
        if (yKey === 'projects') {
          data[month]++;
        } else {
          data[month] += row.collaboratorsCount || 0;
        }
      }
    });
    label = yKey === 'projects' ? 'Nombre de projets' : 'Nombre de collaborateurs';
  color = palette[2];
  bg = 'rgba(251,192,45,0.12)';
  } else if (this.selectedXAxis === 'date') {
    // Nombre de projets ou collaborateurs par date de création (jour précis)
    const dateMap: { [date: string]: { projects: number; collaborators: number } } = {};
    filtered.forEach(row => {
      if (row.created_at) {
        const date = new Date(row.created_at).toLocaleDateString('fr-FR');
        if (!dateMap[date]) dateMap[date] = { projects: 0, collaborators: 0 };
        dateMap[date].projects++;
        dateMap[date].collaborators += row.collaboratorsCount || 0;
      }
    });
    const yKey: 'projects' | 'collaborators' = this.selectedYAxis;
    const sortedDates = Object.entries(dateMap).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
    labels = sortedDates.map(([date]) => date);
    data = sortedDates.map(([, obj]) => obj[yKey]);
    label = yKey === 'projects' ? 'Nombre de projets' : 'Nombre de collaborateurs';
  color = palette[5];
  bg = 'rgba(2,136,209,0.12)';
  } else if (this.selectedXAxis === 'status') {
    // Nombre de projets ou collaborateurs par statut
    const statusMap: { [status: string]: { projects: number; collaborators: number } } = {};
    filtered.forEach(row => {
      const status = row.status || 'Inconnu';
      if (!statusMap[status]) statusMap[status] = { projects: 0, collaborators: 0 };
      statusMap[status].projects++;
      statusMap[status].collaborators += row.collaboratorsCount || 0;
    });
    const yKey: 'projects' | 'collaborators' = this.selectedYAxis;
    const sortedStatus = Object.entries(statusMap);
    labels = sortedStatus.map(([status]) => status);
    data = sortedStatus.map(([, obj]) => obj[yKey]);
    label = yKey === 'projects' ? 'Nombre de projets' : 'Nombre de collaborateurs';
  color = palette[3];
  bg = 'rgba(211,47,47,0.12)';
  }

    // Pour les axes X catégoriels, colorer chaque barre différemment
    let barColors: string[] = [];
    if (["user", "category", "status", "date"].includes(this.selectedXAxis)) {
      barColors = labels.map((_, i) => palette[i % palette.length]);
    } else {
      barColors = Array(labels.length).fill(color);
    }

    this.dynamicChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          borderColor: barColors,
          backgroundColor: barColors.map(c => c + '22'), // Opacité 13% pour le fond
          hoverBackgroundColor: barColors.map(c => c + '66'),
          hoverBorderColor: barColors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            backgroundColor: '#222',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#fff',
            borderWidth: 1
          }
        },
        scales: {
          x: { title: { display: true, text: '' }, grid: { color: '#e0e0e0' } },
          y: { title: { display: true, text: label }, beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f5f5f5' } }
        }
      }
    });
  }
  dynamicChart: any;

  // Recherche de projets par titre ou auteur
  onProjectSearch(query: string): void {
    const search = query.trim().toLowerCase();
    if (!search) {
      this.filteredData = this.rowData.filter(row => this.selectedStatus === null || row.status === this.selectedStatus);
    } else {
      this.filteredData = this.rowData.filter(row => {
        const title = row.title?.toLowerCase() || '';
        const author = row.author?.toLowerCase() || '';
        const nom_utilisateur = row.nom_utilisateur?.toLowerCase() || '';
        return (
          (this.selectedStatus === null || row.status === this.selectedStatus) &&
          (title.includes(search) || author.includes(search) || nom_utilisateur.includes(search))
        );
      });
    }
    this.currentPage = 1;
    this.paginate(this.filteredData);
  }

  // Suppression des graphes statiques, tout passe par dynamicChart
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
    // Appliquer le thème selon le localStorage
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    this.updateThemeClass();
  }

  ngAfterViewInit() {
    setTimeout(() => this.renderDynamicChart(), 0);
  }

  // Suppression de renderChart et des graphes statiques

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

  // (supprimé doublon ngAfterViewInit)

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
    // Navigation vers le détail projet admin (chemin cohérent avec le routing)
    this.router.navigate(['/admin/dashboard/project-detail', this.selectedProjectId]);
  }
// Recharge les projets de l'admin et le nombre de collaborateurs pour chaque projet
  loadAdminProjects() {
    this.projetService.getProjects().subscribe({
      next: (projects: any[]) => {
        const adminProjects = (projects || []).filter(p => String(p.admin_id) === String(this.adminId));
        // Pour chaque projet, charger le nombre de collaborateurs
        const mapped = adminProjects.map((p, idx) => {
          const author =  p.nom_user || '';
          return {
            sn: p.id,
            title: p.titre_projet || '',
            author,
            nom_utilisateur: p.nom_utilisateur || '',
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
        // Mettre à jour les listes uniques pour les filtres
        this.uniqueCategories = this.getUniqueCategories();
        this.uniqueUsers = this.getUniqueUsers();
        // Rafraîchir le repère dynamique après chargement des données
        setTimeout(() => this.renderDynamicChart(), 0);
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

  // Méthodes pour obtenir les catégories et utilisateurs uniques
  getUniqueCategories(): string[] {
    return this.rowData
      .map(r => r.nom_categorie)
      .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
      .filter((v, i, a) => a.indexOf(v) === i);
  }

  getUniqueUsers(): string[] {
    return this.rowData
      .map(r => r.author || r.nom_utilisateur)
      .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
      .filter((v, i, a) => a.indexOf(v) === i);
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
