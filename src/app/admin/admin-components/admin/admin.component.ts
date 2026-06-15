  
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProjetService } from '../../../services/projet.service';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LogoutConfirmDialogComponent } from '../../../shared/logout-confirm-dialog/logout-confirm-dialog.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  projects: any[] = [];
  filteredProjects: any[] = [];
  searchQuery: string = '';
  notifications: any[] = [];
  token: string | null = null;
  isLoggedIn: boolean = false;
  name: string = '';
  projectStatuses: string[] = [];
  selectedProjectStatus: string | null = null;
  surname!: string;
  role!: string;
  id: any;
  matricule!: string;
  tbl_filiere_id!: string;
  email!: string;
  photo: string = 'assets/img/default.png'; // photo par défaut

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private projetService: ProjetService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}
    openedStatus: string | null = null; // Pour gérer le statut déroulé
  isProjectsCollapsed: boolean = true;
  toggleProjects() {
    this.isProjectsCollapsed = !this.isProjectsCollapsed;
  }

  toggleStatus(status: string) {
    if (this.openedStatus === status) {
      this.openedStatus = null;
      this.selectedProjectStatus = null;
      this.filteredProjects = [];
    } else {
      this.openedStatus = status;
      this.selectedProjectStatus = status;
      this.filterProjectsByStatus(status);
    }
  }

  ngOnInit(): void {
    this.checkLoginState();
    // Charger le profil utilisateur AVANT de charger les projets
    this.userService.loadUserProfile();
    this.userService.getUserProfile().subscribe({
      next: (userData) => {
        // Correspondance stricte avec le modèle User Laravel
        this.id = userData?.id;
        this.name = userData?.nom_user || userData?.name || '';
        this.role = userData?.role;
        this.photo = this.getFullImageUrl(userData?.photo);
        // Charge les projets seulement si l'id est bien défini
        if (this.id) {
          this.getAllProjects();
        } else {
          this.projects = [];
          this.filteredProjects = [];
        }
      },
      error: () => {
        this.photo = 'assets/img/default.png';
        this.projects = [];
        this.filteredProjects = [];
      }
    });
    this.loadNotifications();

    // S'abonner aux changements de statut des projets
    this.projetService.projectStatusChanged$.subscribe((projectId) => {
      this.getAllProjects();
    });
  }

  checkLoginState(): void {
    this.token = localStorage.getItem('token');
    this.isLoggedIn = !!this.token;
    if (!this.isLoggedIn) {
      this.name = '';
    }
  }

  @ViewChild('toggleSidebarBtn', { static: true }) toggleSidebarBtn!: ElementRef;
  @ViewChild('body', { static: true }) sidebar!: ElementRef;

  toggleSidebar(): void {
    this.sidebar.nativeElement.classList.toggle('toggle-sidebar');
  }

  getAllProjects(): void {
    if (!this.id) {
      this.projects = [];
      this.filteredProjects = [];
      this.projectStatuses = [];
      return;
    }
    this.projetService.getProjects().subscribe({
      next: (projets) => {
        // Filtrer les projets assignés à l'admin connecté
        this.projects = (projets || [])
          .filter((project: any) => String(project.admin_id) === String(this.id))
          .map((project: any) => ({
            // Correspondance stricte avec le modèle TblProjet Laravel
            id: project.id,
            titre_projet: project.titre_projet || '',
            descript_projet: project.descript_projet || '',
            tbl_niveau_id: project.tbl_niveau_id || '',
            tbl_categorie_id: project.tbl_categorie_id || '',
            user_id: project.user_id || '',
            views: project.views || 0,
            image: project.image || '',
            admin_id: project.admin_id || '',
            status: project.status || '',
            author: project.user?.nom_user || '',
            category: project.categorie?.nom_categorie || '',
            level: project.niveau?.nom_niveau || '',
            date: project.created_at || '',
            email: project.user?.email || ''
          }))
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // Met à jour la liste des statuts uniques
        this.projectStatuses = Array.from(new Set(this.projects.map(p => p.status).filter(Boolean)));
        this.applySearch();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des projets admin:', err);
        this.projects = [];
        this.filteredProjects = [];
        this.projectStatuses = [];
      }
    });
  }

  // Filtre les projets par statut sélectionné dans l'aside
  filterProjectsByStatus(status: string) {
    this.selectedProjectStatus = status;
    this.filteredProjects = this.projects.filter(p => p.status === status);
  }

  // Pour réafficher tous les projets (option "Tous les statuts")
  showAllProjects() {
    this.selectedProjectStatus = null;
    this.filteredProjects = [...this.projects];
  }

  applySearch(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredProjects = [...this.projects];
      return;
    }
    this.filteredProjects = this.projects.filter(project =>
      (project.titre_projet && project.titre_projet.toLowerCase().includes(query)) ||
      (project.author && project.author.toLowerCase().includes(query)) ||
      (project.category && project.category.toLowerCase().includes(query))
    );
  }

  onSearchInputChange(event: any): void {
    this.searchQuery = event.target.value;
    this.applySearch();
  }

  // Pour debug : méthode manuelle de rafraîchissement
  refreshProjects(): void {
    this.getAllProjects();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(notifications => {
      const uniqueNotifications = new Map<string, any>();
      (notifications || []).forEach((notification: any) => {
        const key = this.getNotificationKey(notification);
        if (key && !uniqueNotifications.has(key)) {
          uniqueNotifications.set(key, notification);
        }
      });
      this.notifications = Array.from(uniqueNotifications.values());
    });
  }

  private getNotificationKey(notification: any): string {
    if (!notification) {
      return '';
    }
    if (notification.id !== undefined && notification.id !== null) {
      return String(notification.id);
    }
    const type = notification.data?.type ?? '';
    const projectId = notification.data?.project_id ?? notification.data?.projet_id ?? notification.project_id ?? '';
    const message = notification.data?.message ?? '';
    const createdAt = notification.created_at ?? '';
    return `${type}|${projectId}|${message}|${createdAt}`;
  }

  markNotificationAsRead(notificationId: number): void {
    this.notificationService.markNotificationAsRead(notificationId).subscribe(() => {
      // remove locally instead of reloading
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
    });
  }

  markAllNotificationAsRead(): void {
    this.notificationService.markAllNotificationAsRead().subscribe(() => {
      // clear list locally
      this.notifications = [];
    });
  }

  private resolveNotificationProjectId(notification: any): number | null {
    if (!notification) {
      return null;
    }
    return notification.data?.project_id || notification.data?.projet_id || notification.project_id || notification.data?.project?.id || null;
  }

  openProjectFromNotification(notification: any): void {
    const projectId = this.resolveNotificationProjectId(notification);
    if (projectId) {
      this.notificationService.markNotificationAsRead(notification.id).subscribe(() => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        this.router.navigate(['/admin/dashboard/project-detail', projectId]);
      });
    } else {
      console.warn('Notification has no project id', notification);
    }
  }

  deconnexion(): void {
    const dialogRef = this.dialog.open(LogoutConfirmDialogComponent, {
      width: '350px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.logout().subscribe({
          next: value => {
            // Token supprimé côté service
            this.router.navigate(['/home']);
          },
          error: err => {
          }
        });
      }
    });
  }



  updateProjectStatus(projectId: number, newStatus: string): void {
    this.projetService.updateProjectStatus(projectId, newStatus).subscribe({
      next: () => {
        this.getAllProjects();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut du projet:', err);
      }
    });
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) {
      return 'assets/img/default.png';
    }
    return imagePath.startsWith('http') ? imagePath : `https://uds-faculte-des-sciences.netlify.app//${imagePath.replace(/^\/+/, '')}`;
  }
}
