  // Gestion des erreurs de formulaire

import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ProjetService } from '../../services/projet.service';
import { DocumentService } from '../../services/document.service';
import { ListingService } from '../../services/listing.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service'; // adapte si tu as un service d'auth

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],  // <== corrigé ici
  animations: [
    trigger('fadeUp', [
      state('void', style({ opacity: 0, transform: 'translateY(200px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms ease-out')),
    ]),
  ],
})
export class ProjectDetailComponent implements OnInit {
  commentsPage = 1;
  commentsPerPage = 6;
  commentsLastPage = 1;
  loadingComments = false;

  loadComments(reset: boolean = false): void {
    if (reset) {
      this.commentsPage = 1;
      this.comments = [];
    }
    this.loadingComments = true;
    this.commentService.getComments(this.id, this.commentsPage, this.commentsPerPage).subscribe({
      next: (data) => {
        if (reset) {
          this.comments = data.comments;
        } else {
          this.comments = [...this.comments, ...data.comments];
        }
        this.commentsLastPage = data.pagination.last_page;
        this.loadingComments = false;
      },
      error: err => {
        this.loadingComments = false;
        console.error('Erreur chargement commentaires', err);
      },
    });
  }

  loadMoreComments() {
    if (this.commentsPage < this.commentsLastPage && !this.loadingComments) {
      this.commentsPage++;
      this.loadComments();
    }
  }

  commentErrors: { name?: string; email?: string; comment?: string } = {};

  projects: any[] = [];
  documents: any[] = [];
  comments: any[] = [];

  selectedProjectTitle!: string;
  projectStatus!: string;
  projectImage!: string;
  description!: string;
  views!: number;
  author!: string;
  category!: string;
  level!: string;
  type!: string;
  date!: string;
  email!: string;
  id!: number;
  user_id: any;

  // Commentaires
  newComment: string = '';
  visitorName: string = '';
  visitorEmail: string = '';
  currentUser: any = null;

  isExpanded2 = false;
  isProjectExpanded2 = false;
  isExpanded = false;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private projetService: ProjetService,
    private documentService: DocumentService,
    private projectByIdService: ListingService,
    private commentService: CommentService,
    private authService: AuthService
  ) {}


  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    if (this.id) {
      // Charger les détails du projet principal
      this.projetService.getProjectById(this.id).subscribe(project => {
        this.selectedProjectTitle = project.titre_projet || project.title;
        this.projectStatus = project.status;
        this.projectImage = project.image;
        this.description = project.descript_projet || project.description;
        this.category = project.category;
        this.type = project.type;
        this.date = project.date;
        this.views = project.views;
        this.author = project.nom_utilisateur || project.author;
        this.level = project.niveau || project.level;
        this.email = project.email || '';
      });

      this.loadComments(true);
      this.documentService.getDocumentsByProject(this.id).subscribe(response => {
        this.documents = response;
      });
    }

    this.projetService.countViews(this.id).subscribe({
      next: value => {},
      error: () => {},
    });

    this.user_id = localStorage.getItem('id');
    if (this.user_id && this.user_id !== 'null') {
      this.projectByIdService.getApprovedProjectsById(this.user_id).subscribe({
        next: data => { this.projects = data; },
        error: () => {},
      });
    }

    this.currentUser = this.authService.getUser();
  }

  submitComment(): void {
    this.commentErrors = {};
    let hasError = false;

    if (!this.newComment.trim()) {
      this.commentErrors.comment = 'Veuillez écrire un commentaire.';
      hasError = true;
    }

    // Si utilisateur connecté, aucune validation nom/email
    if (!this.currentUser) {
      if (!this.visitorName.trim()) {
        this.commentErrors.name = 'Veuillez entrer votre nom.';
        hasError = true;
      }
      // Email devient optionnel, mais si rempli, doit être valide
      if (this.visitorEmail.trim() && !/^\S+@\S+\.\S+$/.test(this.visitorEmail.trim())) {
        this.commentErrors.email = 'Veuillez entrer un email valide.';
        hasError = true;
      }
    }

    if (hasError) return;

    const payload: any = {
      content: this.newComment.trim()
    };

    if (!this.currentUser) {
      payload.visitor_name = this.visitorName.trim();
      if (this.visitorEmail.trim()) {
        payload.visitor_email = this.visitorEmail.trim();
      }
    }

    // Si utilisateur connecté, envoyer directement avec son nom
    if (this.currentUser) {
      payload.user_id = this.currentUser.id;
      payload.user_name = this.currentUser.username;
    }

    this.commentService.addComment(this.id, payload).subscribe({
      next: () => {
        this.newComment = '';
        this.visitorName = '';
        this.visitorEmail = '';
        this.commentErrors = {};
        this.loadComments(true);
      },
      error: err => {
        console.error('Erreur ajout commentaire', err);
        this.commentErrors.comment = 'Erreur lors de l\'ajout du commentaire.';
      }
    });
  }

  updateProjectDetails(project: any) {
    this.id = project.id;
    this.selectedProjectTitle = project.titre_projet || project.title;
    this.projectStatus = project.status;
    this.projectImage = project.image;
    this.description = project.descript_projet || project.description;
    this.category = project.category;
    this.type = project.type;
    this.date = project.date;
    this.views = project.views;

    this.documentService.getDocumentsByProject(this.id).subscribe(response => {
      this.documents = response;
    });

    this.loadComments();
  }

  toggleExpand2() {
    this.isExpanded2 = !this.isExpanded2;
  }

  toggleProjectExpand2() {
    this.isProjectExpanded2 = !this.isProjectExpanded2;
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  getFullImageUrl(projectImage: string): string {
    if (!projectImage) {
      return '';
    }
    return projectImage.startsWith('http') ? projectImage : `http://localhost:8000/${projectImage.replace(/^\/+/, '')}`;
  }

  getFullDocumentUrl(lien_doc: string): string {
    if (!lien_doc) return '#';
    if (lien_doc.startsWith('http')) return lien_doc;
    if (lien_doc.startsWith('/public') || lien_doc.startsWith('public')) {
      return `http://localhost:8000/${lien_doc.replace(/^\/+/, '')}`;
    }
    return `http://localhost:8000/storage/${lien_doc.replace(/^\/+/, '')}`;
  }

  getFullDocument(documentPath: string) {
    return `http://localhost:8000${documentPath}`;
  }
}
