
import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { DocumentService } from '../../services/document.service';
import { CollaborateurService } from '../../services/collaborateur.service';
import { FacultyService } from '../../services/faculty.service';
import { FiliereService } from '../../services/filiere.service';
import { NiveauService } from '../../services/niveau.service';
import { UniversityService } from '../../services/university.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  categories: any[] = [];
  documents: any[] = [];
  collaborators: any[] = [];
  faculties: any[] = [];
  filieres: any[] = [];
  niveaux: any[] = [];
  universites: any[] = [];

  constructor(
    private categoryService: CategoryService,
    private documentService: DocumentService,
    private collaborateurService: CollaborateurService,
    private facultyService: FacultyService,
    private filiereService: FiliereService,
    private niveauService: NiveauService,
    private universityService: UniversityService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(data => this.categories = data);
    this.documentService.getDocuments().subscribe(data => this.documents = data);
    this.collaborateurService.getCollaborateurs().subscribe(data => this.collaborators = data);
    this.facultyService.getFaculties().subscribe(data => this.faculties = data);
    this.filiereService.getFilieres().subscribe(data => this.filieres = data);
    this.niveauService.getNiveaux().subscribe(data => this.niveaux = data);
    this.universityService.getUniversities().subscribe(data => this.universites = data);
  }
}
