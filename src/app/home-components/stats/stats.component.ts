import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { UniversityService } from '../../services/university.service';
import { FiliereService } from '../../services/filiere.service';
import { ProjetService } from '../../services/projet.service';
import { AcceuilService } from '../../services/acceuil.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
  animations: [
    trigger('fadeUp', [
      state('void', style({ opacity: 0, transform: 'translateY(200px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', animate('600ms ease-out')),
    ]),
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', [
        animate('1s ease-in')
      ]),
    ])
  ],
})
export class StatsComponent implements OnInit {

  data1: any[] = [];
  data2: any[] = [];
  data3: any[] = [];
  universityCount: number = 0;
  filiereCount: number = 0;
  projetCount: number = 0;

  constructor(
    private universiteService: UniversityService, 
    private filiereService: FiliereService, 
    private acceuilService:AcceuilService
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

    this.acceuilService.getProjectsByOrder().subscribe(projet => {
      this.data3 = projet;
      this.projetCount = this.data3.length;
    });
  }
}
