import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { Router } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { UserService } from '../../services/user.service';
import { CollaborateurService } from '../../services/collaborateur.service';
import { ProjetstatusService } from '../../services/projetstatus.service';

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
  description?: string;
  rejection_reason?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  // --- Popup rejet projet ---
  showRejectModal = false;
  rejectReason: string = '';
  rejectError: boolean = false;
  rejectProjectId: number | null = null;
  isLoadingStatus: number | null = null;
  isLoadingProjects = false;

  // --- Popup restauration projet ---
showRestoreModal = false;
restoreReason: string = '';
restoreError: boolean = false;
restoreProjectId: number | null = null;

  // --- Chargement des données ---
openRestoreModal(projectId: number) {
  this.restoreProjectId = projectId;
  this.restoreReason = '';
  this.restoreError = false;
  this.showRestoreModal = true;
}

closeRestoreModal() {
  this.showRestoreModal = false;
  this.restoreError = false;
  this.restoreReason = '';
  this.restoreProjectId = null;
}

confirmRestore() {
  if (!this.restoreReason || this.restoreReason.trim().length === 0) {
    this.restoreError = true;
    return;
  }
  this.restoreError = false;
  this.showRestoreModal = false;
  if (this.restoreProjectId) {
    this.isLoadingStatus = this.restoreProjectId;
    // On réutilise updateProjectStatus mais avec le motif
    this.projetService.updateProjectStatusWithReason(
      this.restoreProjectId, 
      'Pending',
      this.restoreReason
    ).subscribe({
      next: () => {
        this.projetService.notifyProjectChanged(this.restoreProjectId!);
        this.isLoadingStatus = null;
        this.loadAdminProjects();
      },
      error: (err: any) => {
        this.isLoadingStatus = null;
        console.error('Erreur lors de la restauration:', err);
      }
    });
  }
}

  // ...autres propriétés...
  expandedDescription: { [sn: number]: boolean } = {};
  projectActionsCache: { [sn: number]: any[] } = {};

  // Pagination
  rowData: RowData[] = [];
  filteredData: RowData[] = [];
  paginatedData: RowData[] = [];
  currentPage = 1;
  rowsPerPage = 8;
  totalPages: number[] = [];

  // Filtres et stats
  uniqueCategories: string[] = [];
  uniqueUsers: string[] = [];
  selectedYAxis: 'projects' | 'collaborators' = 'projects';
  selectedXAxis: string = 'user';
  selectedStatusFilter: string = 'all';
  selectedCategoryFilter: string = 'all';
  selectedUserFilter: string = 'all';
  adminId: any = null;
  projectStatus: ProjectStatus = {
    Approved: 0,
    Pending: 0,
    Rejected: 0
  };
  selectedProjectId!: number;
  approvedProjects!: number;
  pendingProjects!: number;
  rejectedProjects!: number;
  selectedStatus: string | null = null;
  selectedProjectTitle: string | null = null;
  isSidebarCollapsed = true;
  isDarkTheme = false;
  dynamicChart: any;
  chartHasData = false;
  rowSelection = 'single';

  chartPercentages: number[] = [];
  chartDescriptions: string[] = [];
  interpretationText: string = '';

  constructor(
    private router: Router,
    private projetService: ProjetService,
    private userService: UserService,
    private collaborateurService: CollaborateurService,
    private projetstatusService: ProjetstatusService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.userService.loadUserProfile();
    this.userService.getUserProfile().subscribe(users => {
      if (users && users.id) {
        this.adminId = users.id;
        this.loadAdminProjects();
      }
    });
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    this.updateThemeClass();

    // S'abonner aux changements de statut des projets
    this.projetService.projectStatusChanged$.subscribe((projectId) => {
      this.loadAdminProjects();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.renderDynamicChart(), 0);
  }

  // --- Popup rejet projet ---
  openRejectModal(projectId: number) {
    this.rejectProjectId = projectId;
    this.rejectReason = '';
    this.rejectError = false;
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.rejectError = false;
    this.rejectReason = '';
    this.rejectProjectId = null;
  }

  confirmReject() {
    if (!this.rejectReason || this.rejectReason.trim().length === 0) {
      this.rejectError = true;
      return;
    }
    this.rejectError = false;
    this.showRejectModal = false;
    if (this.rejectProjectId) {
      this.isLoadingStatus = this.rejectProjectId;
      this.projetstatusService.rejectProject(this.rejectProjectId, this.rejectReason).subscribe({
        next: () => {
          this.projetService.notifyProjectChanged(this.rejectProjectId!);
          this.isLoadingStatus = null;
          this.loadAdminProjects();
        },
        error: (err: any) => {
          this.isLoadingStatus = null;
          console.error('Erreur lors du rejet du projet:', err);
        }
      });
    }
  }

  // --- Actions projet ---
  getProjectDescription(project: any): string {
    if (project.description) return project.description;
    const found = this.rowData.find(r => r.sn === project.sn);
    return found && (found as any).description ? (found as any).description : '';
  }

  getProjectActions(project: RowData) {
    return this.projectActionsCache[project.sn] || [];
  }

  updateAllProjectActions() {
    this.projectActionsCache = {};
    for (const project of this.rowData) {
      const actions = [
        {
          label: 'Voir',
          icon: 'bi bi-eye',
          class: 'btn btn-outline-primary btn-sm d-flex align-items-center',
          title: 'Voir le projet',
          onClick: () => this.showDetail(project)
        }
      ];
      if (project.status === 'Approved') {
        actions.push({
          label: 'En attente',
          icon: 'bi bi-hourglass-split',
          class: 'btn btn-outline-warning btn-sm d-flex align-items-center',
          title: 'Mettre en attente',
          onClick: () => this.openRestoreModal(project.sn) // ← remplacer l'ancien appel
        });
      }
      if (project.status === 'Pending') {
        actions.push({
          label: 'Approuver',
          icon: 'bi bi-check-circle',
          class: 'btn btn-outline-success btn-sm d-flex align-items-center',
          title: 'Approuver',
          onClick: () => this.updateProjectStatus(project.sn, 'Approved')
        });
        actions.push({
          label: 'Rejeter',
          icon: 'bi bi-x-circle',
          class: 'btn btn-outline-danger btn-sm d-flex align-items-center',
          title: 'Rejeter',
          onClick: () => this.openRejectModal(project.sn)
        });
      }
      if (project.status === 'Rejected') {
        actions.push({
          label: 'Restaurer',
          icon: 'bi bi-arrow-repeat',
          class: 'btn btn-outline-info btn-sm d-flex align-items-center',
          title: 'Remettre en attente',
          onClick: () => this.updateProjectStatus(project.sn, 'Pending')
        });
      }
      this.projectActionsCache[project.sn] = actions;
    }
  }

  // --- Thème ---
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

  // --- Filtres et recherche ---
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

  onProjectSearch(query: string): void {
    const search = query.trim().toLowerCase();
    if (!search) {
      this.filteredData = this.rowData.filter(row => this.selectedStatus === null || row.status === this.selectedStatus);
    } else {
      this.filteredData = this.rowData.filter(row => {
        const title = row.title?.toLowerCase() || '';
        const author = row.author?.toLowerCase() || '';
        const nom_utilisateur = row.nom_utilisateur?.toLowerCase() || '';
        const status = row.status?.toLowerCase() || '';
        const description = (row as any).description?.toLowerCase() || '';
        return (
          (this.selectedStatus === null || row.status === this.selectedStatus) &&
          (
            title.includes(search) ||
            author.includes(search) ||
            nom_utilisateur.includes(search) ||
            status.includes(search) ||
            description.includes(search)
          )
        );
      });
    }
    this.currentPage = 1;
    this.paginate(this.filteredData);
  }

  filterTable(status: string): void {
    this.filteredData = this.rowData.filter(row => status === '' || row.status === status);
    this.currentPage = 1;
    this.paginate(this.filteredData);
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

  // --- Pagination ---
  paginate(data: RowData[]): void {
    const total = Math.ceil(data.length / this.rowsPerPage);
    this.totalPages = Array.from({ length: total }, (_, i) => i + 1);
    if (this.currentPage > total) this.currentPage = total > 0 ? total : 1;
    if (this.currentPage < 1) this.currentPage = 1;
    this.changePage(this.currentPage, data);
  }

  changePage(page: number, data: RowData[] = this.filteredData): void {
    const total = Math.ceil(data.length / this.rowsPerPage);
    if (page < 1) page = 1;
    if (page > total) page = total > 0 ? total : 1;
    this.currentPage = page;
    const start = (page - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedData = data.slice(start, end);
  }

  // --- Navigation ---
  showDetail(selectedRow: any) {
    this.selectedProjectId = selectedRow.sn;
    this.router.navigate(['/admin/dashboard/project-detail', this.selectedProjectId]);
  }

  // --- Chargement des projets ---
  loadAdminProjects() {
    this.isLoadingProjects = true;
    this.projetService.getProjects().subscribe({
      next: (projects: any[]) => {
        this.isLoadingProjects = false;
        const adminProjects = (projects || []).filter(p => String(p.admin_id) === String(this.adminId));
        const mapped = adminProjects.map((p, idx) => {
          const author = p.nom_user || '';
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
            collaboratorsCount: 0,
            description: p.descript_projet || '',
            rejection_reason: p.rejection_reason || ''
          };
        });
        this.rowData = mapped;
        this.filteredData = [...this.rowData];
        this.updateAllProjectActions();
        this.paginate(this.filteredData);
        this.approvedProjects = adminProjects.filter(p => p.status === 'Approved').length;
        this.pendingProjects = adminProjects.filter(p => p.status === 'Pending').length;
        this.rejectedProjects = adminProjects.filter(p => p.status === 'Rejected').length;
        this.rowData.forEach((row, idx) => {
          this.collaborateurService.getCollaborateursByProject(row.sn).subscribe(collabs => {
            this.rowData[idx].collaboratorsCount = collabs.length;
            this.updateAllProjectActions();
          });
        });
        this.uniqueCategories = this.getUniqueCategories();
        this.uniqueUsers = this.getUniqueUsers();
        this.isLoadingProjects = false;
        setTimeout(() => this.renderDynamicChart(), 0);
      },
      error: (err) => {
        this.isLoadingProjects = false;
        console.error('Erreur lors du chargement des projets admin:', err);
        this.rowData = [];
        this.filteredData = [];
        this.paginatedData = [];
        this.approvedProjects = 0;
        this.pendingProjects = 0;
        this.rejectedProjects = 0;
        this.isLoadingProjects = false;
      }
    });
  }

  // --- Statut projet ---
  updateProjectStatus(projectId: number, newStatus: string): void {
    this.isLoadingStatus = projectId;
    this.projetService.updateProjectStatus(projectId, newStatus).subscribe({
      next: () => {
        this.projetService.notifyProjectChanged(projectId);
        this.isLoadingStatus = null;
        this.loadAdminProjects();
      },
      error: (err) => {
        this.isLoadingStatus = null;
        console.error('Erreur lors de la mise à jour du status du projet:', err);
      }
    });
  }

  // --- Graphique dynamique ---
  renderDynamicChart() {
    const canvas = document.getElementById('dynamicChart') as HTMLCanvasElement | null;
    if (!canvas) {
      return;
    }

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
    if (this.dynamicChart) {
      this.dynamicChart.destroy();
      this.dynamicChart = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // helper to create subtle vertical gradient per bar
    const createGradient = (baseHex: string) => {
      try {
        const g = ctx.createLinearGradient(0, 0, 0, 360);
        // convert hex like #1976d2 to rgba endpoints
        const hex = baseHex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const gcol = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        g.addColorStop(0, `rgba(${r}, ${gcol}, ${b}, 0.95)`);
        g.addColorStop(0.6, `rgba(${r}, ${gcol}, ${b}, 0.45)`);
        g.addColorStop(1, `rgba(${r}, ${gcol}, ${b}, 0.12)`);
        return g;
      } catch (e) {
        return baseHex;
      }
    };

    let labels: string[] = [];
    let data: number[] = [];
    let label = '';
    const palette = [
      '#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b', '#ffa000', '#388e3c', '#303f9f',
      '#0097a7', '#cddc39', '#e64a19', '#512da8', '#00796b', '#f57c00', '#0288d1', '#c2185b', '#afb42b', '#5d4037'
    ];
    let color = palette[0];
    let bg = 'rgba(25, 118, 210, 0.12)';

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

    let barColors: string[] = [];
    if (["user", "category", "status", "date"].includes(this.selectedXAxis)) {
      barColors = labels.map((_, i) => palette[i % palette.length]);
    } else {
      barColors = Array(labels.length).fill(color);
    }

    // Determine if chart has meaningful data
    this.chartHasData = labels.length > 0 && data.some(val => val && val > 0);
    if (!this.chartHasData) {
      // clear canvas and show friendly message
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.fillStyle = '#6c757d';
      ctx.font = '16px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Aucune donnée', canvas.width / 2, (canvas.height / 2) - 8);
      ctx.restore();
      return;
    }

    const datasetBackgrounds = barColors.map(c => createGradient(c as string));

    // compute percentages and descriptions
    const total = data.reduce((s, v) => s + (Number(v) || 0), 0) || 0;
    this.chartPercentages = data.map(v => total > 0 ? Math.round(((Number(v) || 0) / total) * 100) : 0);
    this.chartDescriptions = labels.map((lbl, i) => {
      const val = data[i] || 0;
      const pct = this.chartPercentages[i] || 0;
      return `${lbl}: ${val} (${pct}%) — Représente ${pct}% du total.`;
    });

    const self = this;
    this.dynamicChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          borderColor: barColors,
          backgroundColor: datasetBackgrounds,
          hoverBackgroundColor: barColors.map(c => c + '66'),
          hoverBorderColor: barColors,
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.75,
          categoryPercentage: 0.9
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              generateLabels: function(chart: any) {
                const meta = chart.getDatasetMeta(0);
                return chart.data.labels.map((label: any, i: number) => ({
                  text: `${label} — ${chart.data.datasets[0].data[i]} (${self.chartPercentages[i] || 0}%)`,
                  fillStyle: chart.data.datasets[0].borderColor[i] || chart.data.datasets[0].borderColor,
                  hidden: false,
                  index: i
                }));
              }
            }
          },
          title: { display: false },
          tooltip: {
            backgroundColor: '#222',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#fff',
            borderWidth: 1,
            callbacks: {
              label: (context: any) => {
                const v = context.parsed.y ?? context.parsed ?? 0;
                const idx = context.dataIndex ?? context.index ?? 0;
                const pct = self.chartPercentages[idx] ?? 0;
                const desc = self.chartDescriptions[idx] ?? '';
                return `${context.label || ''}: ${v} (${pct}%)\n${desc}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: false },
            grid: { display: false },
            ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 10 }
          },
          y: {
            title: { display: true, text: label },
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: '#f5f5f5' }
          }
        },
        layout: { padding: { top: 8, bottom: 8, left: 0, right: 0 } },
        onHover: function(event: any, elements: any[], chart: any) {
          if (elements && elements.length > 0) {
            const idx = elements[0].index;
            self.ngZone.run(() => { self.interpretationText = self.chartDescriptions[idx] || ''; });
          } else {
            self.ngZone.run(() => { self.interpretationText = ''; });
          }
        }
      }
    });
  }

  downloadChart() {
    const canvas = document.getElementById('dynamicChart') as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png', 0.92);
    link.download = `dashboard-chart-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.png`;
    link.click();
  }

  // --- Sidebar ---
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // --- Status Card ---
  public onCardClick = (status: string): void => {
    this.selectedStatus = status;
    this.filterTable(status);
    setTimeout(() => {
      const projectSection = document.getElementById('selectedStatusSection');
      if (projectSection) {
        projectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  hideProjectList() {
    this.selectedStatus = null;
    this.filteredData = [];
    this.paginatedData = [];
    this.loadAdminProjects();
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
}
