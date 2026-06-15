 

import { Component, OnInit, OnDestroy, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { ProjetService } from '../../../services/projet.service';
import { ListingService } from '../../../services/listing.service';
import { LogoutConfirmDialogComponent } from '../../../shared/logout-confirm-dialog/logout-confirm-dialog.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
  token: string = '';
  user_name: string = '';
  role: string = '';
  id: string = '';
  photo: string = 'assets/img/default.png';


isLoadingMarkAllRead = false;
isLoadingMarkRead: number | null = null;
isLoadingLogout = false;

  showProfileDropdown = false;
  isProjectsOpen = false;

  notifications: any[] = [];
  dismissedNotificationIds: number[] = [];
  userProfile: any = {};
  projects: any[] = [];
  filteredProjects: any[] = [];
  searchQuery: string = '';
  selectedTypeFilter: string = 'all';
  availableTypes: string[] = ['Projet', 'Mémoire', 'Article'];
  selectedStatus: string | null = null;
  availableStatuses: string[] = [];
  selectedProjectId: number | null = null;
  goToProject(projectId: number | null): void {
    if (projectId) {
      this.router.navigate(['/user/dashboard/project-detail', projectId]);
    }
  }

  refreshInterval: any;

  @ViewChild('toggleSidebarBtn', { static: true }) toggleSidebarBtn!: ElementRef;
  @ViewChild('body', { static: true }) sidebar!: ElementRef;

  constructor(
    private projectByIdService: ListingService,
    private projetService: ProjetService,
    private router: Router,
    private userService: UserService,
    private renderer: Renderer2,
    private el: ElementRef,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Récupère les infos utilisateur depuis le localStorage
    this.token = localStorage.getItem('token') || '';
    this.user_name = localStorage.getItem('name') || '';
    this.role = localStorage.getItem('role') || '';
    this.id = localStorage.getItem('id') || '';

    const storedPhoto = localStorage.getItem('photo');
    this.photo = storedPhoto && storedPhoto !== 'null' && storedPhoto !== 'undefined'
      ? (storedPhoto.startsWith('http') ? storedPhoto : `https://dschangschoolhub.duckdns.org/${storedPhoto}`)
      : 'assets/img/default.png';

    // Mets à jour le UserService si besoin
    this.userService.userSubject.next({
      name: this.user_name,
      id: this.id,
      token: this.token,
      role: this.role,
      photo: this.photo
    });

    if (this.id) this.loadProjects();

    this.userService.loadUserProfile();
    this.userService.getUserProfile().subscribe(profile => {
      if (profile) {
        this.userProfile = profile;
        if (profile.photo) {
          this.photo = profile.photo.startsWith('http')
            ? profile.photo
            : `https://dschangschoolhub.duckdns.org/${profile.photo}`;
        }
      }
    });

    this.loadNotifications();

    // 🔄 Rafraîchissement automatique toutes les 20 secondes
    this.refreshInterval = setInterval(() => {
      this.loadNotifications();
    }, 20000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadProjects(): void {
    this.projectByIdService.getProjectsById(this.id).subscribe({
      next: (data) => {
        // Trie par plus récent (suppose champ created_at ou date similaire)
        this.projects = (data ?? []).sort((a, b) => {
          const dateA = new Date(a.created_at || a.date || 0).getTime();
          const dateB = new Date(b.created_at || b.date || 0).getTime();
          return dateB - dateA;
        });
        // Extraire tous les statuts uniques présents dans les projets
        this.availableStatuses = Array.from(new Set(this.projects.map(p => p.status).filter(Boolean)));
        this.applyCombinedFilter();
      },
      error: (err) => {
        console.error('Erreur chargement projets:', err);
        this.projects = [];
        this.filteredProjects = [];
      }
    });
  }

  applyCombinedFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    const selectedType = this.selectedTypeFilter.toLowerCase();
    const selectedStatus = this.selectedStatus;

    this.filteredProjects = this.projects.filter(project => {
      const titre = (project.titre ?? '').toLowerCase();
      const type = (project.type ?? '').toLowerCase();
      const status = (project.status ?? '').toLowerCase();

      const matchesSearch = titre.includes(query) || type.includes(query);
      const matchesType = selectedType === 'all' || type === selectedType;
      const matchesStatus = !selectedStatus || status === selectedStatus.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  filterByStatus(status: string | null): void {
    this.selectedStatus = status;
    this.applyCombinedFilter();
  }

  clearStatusFilter(): void {
    this.selectedStatus = null;
    this.applyCombinedFilter();
  }

  // Chargement des notifications utilisateur
  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        // Éviter les doublons en utilisant l'ID comme clé unique
        const uniqueNotifications = Array.from(
          new Map((data || []).map(n => [n.id, n])).values()
        );
        this.notifications = uniqueNotifications;
      },
      error: (err) => {
        console.error('Erreur chargement notifications:', err);
        this.notifications = [];
      }
    });
  }

  // Déconnexion utilisateur
  deconnexion(): void {
  this.isLoadingLogout = true;
  const dialogRef = this.dialog.open(LogoutConfirmDialogComponent, {
    width: '350px'
  });
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.userService.logout().subscribe({
        next: () => {},
        error: err => {
          console.log(err);
          this.isLoadingLogout = false;
        },
        complete: () => {
          localStorage.clear();
          this.router.navigate(['/home']);
          this.isLoadingLogout = false;
        }
      });
    } else {
      this.isLoadingLogout = false;
    }
  });
}

  // Ouvre/ferme le menu latéral sur mobile
  toggleSidebar(): void {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('sidebar-mobile-open');
    }
  }

  // Filtre les projets selon la recherche
  filterProjects(): void {
    this.applyCombinedFilter();
  }

  // Marquer toutes les notifications comme lues
  markAllNotificationAsRead(): void {
    this.isLoadingMarkAllRead = true;
    this.notificationService.markAllNotificationAsRead().subscribe({
      next: () => {
        // Vider le tableau des notifications au lieu de recharger
        this.notifications = [];
      },
      error: () => {},
      complete: () => { this.isLoadingMarkAllRead = false; }
    });
  }

  // Marquer une notification comme lue
  markNotificationAsRead(id: number): void {
    this.isLoadingMarkRead = id;
    this.notificationService.markNotificationAsRead(id).subscribe({
      next: () => {
        // Retirer la notification du tableau au lieu de recharger
        this.notifications = this.notifications.filter(n => n.id !== id);
      },
      error: () => {},
      complete: () => { this.isLoadingMarkRead = null; }
    });
  }

  // Ouvrir les détails du projet en cliquant sur une notification
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
        this.router.navigate(['/user/dashboard/project-detail', projectId]);
      });
    } else {
      console.warn('Project ID not found in notification data', notification);
    }
  }

  // Ouvre/ferme la liste des projets dans le sidebar
  toggleProjects(): void {
    this.isProjectsOpen = !this.isProjectsOpen;
  }

  // Efface le filtre de type
  clearTypeFilter(): void {
    this.selectedTypeFilter = 'all';
    this.applyCombinedFilter();
  }

  // Accordéon sidebar : statut ouvert
  openedStatus: string | null = null;

  toggleStatusAccordion(status: string) {
    this.openedStatus = this.openedStatus === status ? null : status;
  }

  getProjectsByStatus(status: string) {
    return this.filteredProjects.filter(p => p.status === status);
  }

   get collaborateurNotifications(): any[] {
    return this.notifications.filter(n => n.data && n.data.type === 'collaborateur_added');
  }
}