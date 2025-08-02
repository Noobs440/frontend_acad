import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProjetService } from '../../services/projet.service';
import { DocumentService } from '../../services/document.service';
import { ListingService } from '../../services/listing.service';
@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
  animations: [
    trigger('fadeUp', [
      state('void', style({ opacity: 0, transform: 'translateY(200px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms ease-out')),
    ]),

  ],
})
export class ProjectDetailComponent implements OnInit{

  projects:any[]=[];
  documents:any[]=[];
  selectedProjectId!: number;
  selectedProjectTitle!: string;
  projectStatus!:string;
  projectImage!:string;
  description!:string;
  views!:number;
  author!:string;
  category!:string;
  level!: string;
  type!:string;
  date!:string;
  email!:string;
  id!:number;
  user_id:any;
  constructor(
    private route:ActivatedRoute,
    private sanitizer: DomSanitizer,
    private projetService:ProjetService,
    private documentService: DocumentService,
    private projectByIdService:ListingService

  ){}

  selectedPdf:string="";

  getFullDocumentUrl(lien_doc: string): string {
    if (!lien_doc) return '#';
    if (lien_doc.startsWith('http')) return lien_doc;
    if (lien_doc.startsWith('/public') || lien_doc.startsWith('public')) {
      return `https://backend-acad.onrender.com/${lien_doc.replace(/^\/+/, '')}`;
    }
    return `https://backend-acad.onrender.com/storage/${lien_doc.replace(/^\/+/, '')}`;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      this.user_id=params['user_id'];
      this.selectedProjectTitle = params['title'];
      this.projectStatus=params['status'];
      this.projectImage=params['image'];
      this.description=params['description'];
      this.author=params['author'];
      this.category=params['category'];
      this.level=params['level'];
      this.type=params['type'];
      this.date=params['date'];
      this.views=params['views'];
      this.email=params['email']
    });
    this.projetService.countViews(this.id).subscribe({
      next:(value)=>{
        console.log(value)
      },
      error:()=>
      {}
    });

    this.projectByIdService.getApprovedProjectsById(this.user_id).subscribe({
      next: (data) => {
        this.projects = data;
        //this.totalPages = Math.ceil(this.projects.length / this.itemsPerPage);
        //this.updateDisplayedProjects();
      },
      error: () => {
        //this.isLoading = false;
      },
      complete: () => {
       // this.isLoading = false;
      }
    });

    this.documentService.getDocumentsByProject(this.id).subscribe(response => {
      this.documents = response;
    });
  }
  updateProjectDetails(project:any){
    this.id = project.id;
      //this.user_id=params['user_id'];
      this.selectedProjectTitle = project.title;
      this.projectStatus=project.status;
      this.projectImage=project.image;
      this.description=project.description;
      //this.author=project.author;
      this.category=project.category;
      //this.level=project.level;
      this.type=project.type;
      this.date=project.date;
      this.views=project.views;
      //this.email=params['email'];

      this.documentService.getDocumentsByProject(this.id).subscribe(response => {
        this.documents = response;
      });
  }
  isExpanded2 = false;
  isProjectExpanded2 = false;
  // Other component properties

  toggleExpand2() {
    this.isExpanded2 = !this.isExpanded2;
  }

  toggleProjectExpand2() {
    this.isProjectExpanded2 = !this.isProjectExpanded2;
  }


  isExpanded = false;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

    getFullImageUrl(projectImage: string): string {
    if (!projectImage) {
      return '';
    }
    return projectImage.startsWith('http') ? projectImage : `https://backend-acad.onrender.com/${projectImage.replace(/^\/+/, '')}`;
  }
  getFullDocument(documentPath:string){
    return `${'https://backend-acad.onrender.com'}${documentPath}`;
  }

}
