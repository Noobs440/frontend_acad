import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UniversityService } from './university.service';
import { FiliereService } from './filiere.service';
import { ProjetService } from './projet.service';


@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  data1: any[] = [];
  data2: any[] = [];
  data3: any[] = [];
  universityCount: number = 0;
  filiereCount: number = 0;
  projetCount: number = 0;

  constructor(
    private universiteService: UniversityService, 
    private filiereService: FiliereService, 
    private projetService:ProjetService
  ) {}

  ngOnInit(): void {
    this.universiteService.getUniversities().subscribe(univ => {
      this.data1 = univ;
      this.universityCount = this.data1.length;
    });

    this.filiereService.getFilieres().subscribe(filiere => {
      this.data2 = filiere;
      this.filiereCount = this.data2.length;
    });

    this.projetService.getProjects().subscribe(projet => {
      this.data3 = projet;
      this.projetCount = this.data3.length;
    });
  }
  
}
