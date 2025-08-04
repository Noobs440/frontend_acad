import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProjetService } from '../../../services/projet.service';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  projects: any[] = [];
  notifications: any[] = [];
  token!: string;
  name!: string;
  role!: string;
  id: any;

  photo: string = 'assets/img/default-profile.png'; // photo par défaut

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private projetService: ProjetService,
    private notificationService: NotificationService
  ) {}
  isProjectsCollapsed: boolean = true;
  toggleProjects() {
    this.isProjectsCollapsed = !this.isProjectsCollapsed;
  }

  ngOnInit(): void {
    // Charger le profil utilisateur AVANT de charger les projets
    this.userService.loadUserProfile();
    this.userService.getUserProfile().subscribe({
      next: (userData) => {
        this.id = userData?.id;
        this.name = userData?.name;
        this.role = userData?.role;
        this.photo = this.getFullImageUrl(userData?.photo);
        // Charge les projets seulement si l'id est bien défini
        if (this.id) {
          this.getAllProjects();
        } else {
          this.projects = [];
        }
      },
      error: () => {
        this.photo = 'assets/img/default-profile.png';
        this.projects = [];
      }
    });
    this.loadNotifications();
  }

  @ViewChild('toggleSidebarBtn', { static: true }) toggleSidebarBtn!: ElementRef;
  @ViewChild('body', { static: true }) sidebar!: ElementRef;

  toggleSidebar(): void {
    this.sidebar.nativeElement.classList.toggle('toggle-sidebar');
  }

  getAllProjects(): void {
    if (!this.id) {
      this.projects = [];
      return;
    }
    this.projetService.getProjects().subscribe({
      next: (projets) => {
        // Filtrer les projets assignés à l'admin connecté
        this.projects = (projets || []).filter((project: any) => String(project.admin_id) === String(this.id));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des projets admin:', err);
        this.projects = [];
      }
    });
  }

  // Pour debug : méthode manuelle de rafraîchissement
  refreshProjects(): void {
    this.getAllProjects();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  markNotificationAsRead(notificationId: number): void {
    this.notificationService.markNotificationAsRead(notificationId).subscribe(() => {
      console.log('Notification marked as read successfully.');
      this.loadNotifications();
    });
  }

  markAllNotificationAsRead(): void {
    this.notificationService.markAllNotificationAsRead().subscribe(() => {
      console.log('All notifications marked as read successfully.');
      this.loadNotifications();
    });
  }

  deconnexion(): void {
    const result = confirm('Voulez-vous vous déconnecter?');
    if (result) {
      this.userService.logout().subscribe({
        next: value => {
          console.log(value);
          alert('Déconnexion effectuée');
        },
        error: err => {
          console.log(err);
        },
        complete: () => {
          localStorage.removeItem('token');
          this.router.navigate(['/home']);
          console.log("Déconnexion réussie");
        }
      });
    }
  }

  getProjectQueryParams(project: any): any {
    return {
      title: project.titre_projet,
      status: project.status,
      image: project.image,
      description: project.descript_projet,
      views: project.views,
      author: project.nom_utilisateur,
      category: project.nom_categorie,
      level: project.niveau,
      type: project.type,
      date: project.created_at,
      email: project.email
    };
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
      return 'assets/img/default-profile.png';
    }
    return imagePath.startsWith('http') ? imagePath : `https://backend-acad.onrender.com/${imagePath.replace(/^\/+/, '')}`;
  }
}
