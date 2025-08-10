import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProjetService } from '../../../services/projet.service';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { EtudiantService } from '../../../services/etudiant.service'; // Nouveau service
import { CoursService } from '../../../services/cours.service'; // Nouveau service

@Component({
  selector: 'app-enseignant',
  templateUrl: './enseignant.component.html',
  styleUrls: ['./enseignant.component.css']
})
export class EnseignantComponent implements OnInit {
  projects: any[] = [];
  etudiants: any[] = []; // Nouveau
  cours: any[] = []; // Nouveau
  notifications: any[] = [];
  token!: string;
  name!: string;
  role!: string;
  id: any;
  
  // États pour les listes déroulantes
  isProjectsCollapsed: boolean = true;
  isEtudiantsCollapsed: boolean = true; // Nouveau
  isCoursCollapsed: boolean = true; // Nouveau

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private projetService: ProjetService,
    private notificationService: NotificationService,
    private etudiantService: EtudiantService, // Nouveau
    private coursService: CoursService // Nouveau
  ) {}

  ngOnInit(): void {

     if (this.router.url === '/enseignant') {
    this.router.navigate(['/enseignant/dashboard']);
  }
    this.getAllProjects();
    this.getEtudiants(); // Nouveau
    this.getCours(); // Nouveau
    this.loadNotifications();
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.name = params['name'];
      this.role = params['role'];
      this.id = params['id'];
    });
  }

  // Fonctions pour basculer les listes
  toggleProjects() {
    this.isProjectsCollapsed = !this.isProjectsCollapsed;
  }

  toggleEtudiants() { // Nouveau
    this.isEtudiantsCollapsed = !this.isEtudiantsCollapsed;
  }

  toggleCours() { // Nouveau
    this.isCoursCollapsed = !this.isCoursCollapsed;
  }

  @ViewChild('toggleSidebarBtn', { static: true }) toggleSidebarBtn!: ElementRef;
  @ViewChild('body', { static: true }) sidebar!: ElementRef;

  toggleSidebar(): void {
    this.sidebar.nativeElement.classList.toggle('toggle-sidebar');
  }

  // Récupération des données
  getAllProjects(): void {
    this.projetService.getProjects().subscribe(projets => {
      this.projects = projets;
    });
  }

  getEtudiants(): void {
    this.etudiantService.getEtudiants().subscribe((etudiants: any[]) => {
      this.etudiants = etudiants;
    });
  }

 getCours(): void {
    this.coursService.getCours().subscribe((cours: any[]) => {
      this.cours = cours;
    });
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  // Fonctions existantes...
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

  // Ajoutez cette fonction pour les étudiants si nécessaire
  getEtudiantQueryParams(etudiant: any): any {
    return {
      id: etudiant.id,
      nom: etudiant.nom,
      prenom: etudiant.prenom
      // Ajoutez d'autres paramètres selon vos besoins
    };
  }

  // Ajoutez cette fonction pour les cours si nécessaire
  getCoursQueryParams(cours: any): any {
    return {
      id: cours.id,
      titre: cours.titre,
      description: cours.description
      // Ajoutez d'autres paramètres selon vos besoins
    };
  }

  updateProjectStatus(projectId: number, newStatus: string): void {
    this.projetService.updateProjectStatus(projectId, newStatus).subscribe(() => {
      this.getAllProjects();
    });
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) {
      return 'assets/img/default-profile.png';
    }
    return imagePath.startsWith('http') ? imagePath : `http://localhost:8000/${imagePath.replace(/^\/+/, '')}`;
  }
}