import {
  Component,
  OnInit,
  Renderer2,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import { Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { ProjetService } from '../../../services/projet.service';
import { ListingService } from '../../../services/listing.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  animations: [
    trigger('fadeOut', [
      state('in', style({ opacity: 1 })),
      state('out', style({ opacity: 0, height: 0, margin: 0, padding: 0 })),
      transition('in => out', [animate('300ms ease-in')])
    ])
  ]
})
export class UserComponent implements OnInit {
  token: string = '';
  user_name: string = '';
  role: string = '';
  id: string = '';
  photo: string = 'assets/img/default.png';

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
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Récupère les infos utilisateur depuis le localStorage
    this.token = localStorage.getItem('token') || '';
    this.user_name = localStorage.getItem('name') || '';
    this.role = localStorage.getItem('role') || '';
    this.id = localStorage.getItem('id') || '';
    this.photo = localStorage.getItem('photo') || 'assets/img/default.png';

    const storedPhoto = localStorage.getItem('photo');
  this.photo = storedPhoto && storedPhoto !== 'null' && storedPhoto !== 'undefined'
    ? (storedPhoto.startsWith('http') ? storedPhoto : `http://localhost:8000/${storedPhoto}`)
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
            : `http://localhost:8000/${profile.photo}`;
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
        this.projects = data ?? [];
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

    this.filteredProjects = this.projects.filter(project => {
      const titre = (project.titre ?? '').toLowerCase();
      const type = (project.type ?? '').toLowerCase();

      const matchesSearch = titre.includes(query) || type.includes(query);
      const matchesType = selectedType === 'all' || type === selectedType;

      return matchesSearch && matchesType;
    });
  }

  filterProjects(): void {
    this.applyCombinedFilter();
  }

  filterByType(type: string): void {
    this.selectedTypeFilter = type && type.trim() !== '' ? type : 'all';
    this.applyCombinedFilter();
  }

  clearTypeFilter(): void {
    this.selectedTypeFilter = 'all';
    this.applyCombinedFilter();
  }

  toggleProjects() {
    this.isProjectsOpen = !this.isProjectsOpen;
  }

  toggleSidebar(): void {
    this.sidebar.nativeElement.classList.toggle('toggle-sidebar');
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-profile-dropdown')) {
      this.showProfileDropdown = false;
    }
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications ?? [];
      },
      error: () => {
        this.notifications = [];
      }
    });
  }

  markNotificationAsRead(notificationId: number): void {
    this.dismissedNotificationIds.push(notificationId);
    setTimeout(() => {
      this.notificationService.markNotificationAsRead(notificationId).subscribe(() => {
        this.loadNotifications();
        this.dismissedNotificationIds = this.dismissedNotificationIds.filter(id => id !== notificationId);
      });
    }, 300);
  }

  markAllNotificationAsRead(): void {
    this.notificationService.markAllNotificationAsRead().subscribe(() => {
      this.loadNotifications();
    });
  }

  deconnexion(): void {
    const result = confirm('Voulez-vous vous déconnecter ?');
    if (result) {
      this.userService.logout().subscribe({
        next: () => alert('Déconnexion effectuée'),
        error: err => console.log(err),
        complete: () => {
          localStorage.clear();
          this.router.navigate(['/home']);
        }
      });
    }
  }
}