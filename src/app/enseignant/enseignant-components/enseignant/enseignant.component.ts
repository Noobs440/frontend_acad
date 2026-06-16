import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../../../shared/info-dialog/info-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
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
    private coursService: CoursService, // Nouveau
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {

     if (this.router.url === '/enseignant') {
    this.router.navigate(['/enseignant/dashboard']);
  }
    this.getAllProjects();
    this.getEtudiants(); // Nouveau
    this.getCours(); // Nouveau
    this.loadNotifications();

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
      // Éviter les doublons en utilisant l'ID comme clé unique
      const uniqueNotifications = Array.from(
        new Map(notifications.map(n => [n.id, n])).values()
      );
      this.notifications = uniqueNotifications;
    });
  }

  // Marquer une notification comme lue sans recharger la liste
  markNotificationAsRead(notificationId: number): void {
    this.notificationService.markNotificationAsRead(notificationId).subscribe(() => {
      console.log('Notification marked as read successfully.');
      // Retirer la notification du tableau sans recharger
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
    });
  }

  // Marquer toutes les notifications comme lues
  markAllNotificationAsRead(): void {
    this.notificationService.markAllNotificationAsRead().subscribe(() => {
      console.log('All notifications marked as read successfully.');
      // Vider le tableau des notifications
      this.notifications = [];
    });
  }

  // Ouvrir les détails du projet en cliquant sur une notification
  openProjectFromNotification(notification: any): void {
    if (notification?.data?.project_id) {
      // Marquer la notification comme lue puis naviguer
      this.notificationService.markNotificationAsRead(notification.id).subscribe(() => {
        // Retirer la notification du tableau
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        // Naviguer vers les détails du projet
        this.router.navigate(['/enseignant/dashboard/projet-detail', notification.data.project_id]);
      });
    } else {
      console.warn('Project ID not found in notification data', notification);
    }
  }

  deconnexion(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: { title: 'Confirmation', message: 'Voulez-vous vous déconnecter?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.logout().subscribe({
          next: value => {
            console.log(value);
            this.dialog.open(InfoDialogComponent, {
              width: '350px',
              data: { title: 'Succès', message: 'Déconnexion effectuée' }
            });
          },
          error: err => {
            console.log(err);
          },
          complete: () => {
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('token');
            }
            this.router.navigate(['/home']);
            console.log("Déconnexion réussie");
          }
        });
      }
    });
  }



  // Ajoutez cette fonction pour les étudiants si nécessaire


  updateProjectStatus(projectId: number, newStatus: string): void {
    this.projetService.updateProjectStatus(projectId, newStatus).subscribe(() => {
      this.getAllProjects();
    });
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) {
      return 'assets/img/default.png';
    }
    return imagePath.startsWith('http') ? imagePath : `https://dschangschoolhub.duckdns.org/${imagePath.replace(/^\/+/, '')}`;
  }
}