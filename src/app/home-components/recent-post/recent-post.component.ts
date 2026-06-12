import { Component, Input, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AcceuilService } from '../../services/acceuil.service';
import { ProjetService } from '../../services/projet.service';

@Component({
  selector: 'app-recent-post',
  templateUrl: './recent-post.component.html',
  styleUrls: ['./recent-post.component.css'],
  animations: [
    trigger('fadeUp', [
      state('void', style({ opacity: 0, transform: 'translateY(200px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms ease-out')),
    ]),
  ],
})
export class RecentPostComponent implements OnInit {
  @Input() sectionClass: string = 'recent-posts section'; // default class
  @Input() bgColor: string = 's';
  @Input() fColor: string = '';
  @Input() pad!: string;
  @Input() prevButtonColor: string = 'blue'; // Default color for prev button
  @Input() nextButtonColor: string = '#000'; // Default color for next button

  chunkedPosts: any[] = [];
  data: any[] = [];
  private baseUrl: string = 'https://backend-acad.onrender.com';
  maxElements: number = 16;
  allProjects:any;
  isLoading=false;

  constructor(private acceuilService: AcceuilService, private projectDetailService:ProjetService) {}

  ngOnInit(): void {
    this.isLoading=true
    this.acceuilService.getProjectsByOrder().subscribe({
      next: (data) => {
        this.data = data;
        this.chunkPosts();
        //this.isLoading = false;
      },
      error: (err) => {

        this.isLoading = false;
      },
      complete: ()=>{
        this.isLoading = false;
      }
    });

  }


  chunkPosts(): void {
    const chunkSize = 8;
    const limitedPosts = this.data.slice(0, this.maxElements); // Limiter le nombre d'éléments
    for (let i = 0; i < limitedPosts.length; i += chunkSize) {
      this.chunkedPosts.push(limitedPosts.slice(i, i + chunkSize));
    }
  }

  getFullImageUrl(projectImage: string): string {
    if (!projectImage) {
      return '';
    }
    return projectImage.startsWith('http') ? projectImage : `https://backend-acad.onrender.com/${projectImage.replace(/^\/+/, '')}`;
  }

  getFullDocumentUrl(lien_doc: string): string {
    if (!lien_doc) return '#';
    // Si le lien commence déjà par http, retourne tel quel
    if (lien_doc.startsWith('http')) return lien_doc;
    // Si le lien commence par /public ou public, ajoute le préfixe
    if (lien_doc.startsWith('/public') || lien_doc.startsWith('public')) {
      return `https://backend-acad.onrender.com/${lien_doc.replace(/^\/+/, '')}`;
    }
    // Sinon, ajoute /storage/
    return `https://backend-acad.onrender.com/storage/${lien_doc.replace(/^\/+/, '')}`;
  }
}
