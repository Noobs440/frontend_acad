import { Component, OnInit } from '@angular/core';
import { UniversityService } from '../../services/university.service';
import { FiliereService } from '../../services/filiere.service';
import { ProjetService } from '../../services/projet.service';
import { CategoryService} from '../../services/category.service';
import { DocumentService } from '../../services/document.service';
import { CollaborateurService } from '../../services/collaborateur.service';
import { UserService } from '../../services/user.service';
import { FacultyService } from '../../services/faculty.service';
import { NiveauService } from '../../services/niveau.service';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  data1: any[] = [];
  data2: any[] = [];
  data3: any[] = [];
  data4: any[] = [];
  data5: any[] = [];
  data6: any[] = [];
  data7: any[] = [];
  data8: any[] = [];
  data9: any[] = [];

  universityCount: number = 0;
  filiereCount: number = 0;
  projetCount: number = 0;
  categoryCount: number = 0;
  documentCount: number = 0;
  collaborateurCount: number = 0;
  userCount: number = 0;
  facultyCount: number = 0;
  niveauCount: number = 0;

  chartLabels: string[] = ['Universités', 'Filières', 'Projets', 'Catégories', 'Documents', 'Collaborateurs', 'Utilisateurs', 'Facultés', 'Niveaux'];
  chartType: 'bar' | 'line' = 'bar';
  chartData: ChartData<'bar' | 'line'> = {
    labels: this.chartLabels,
    datasets: [
      {
        label: 'Quantité Actuelle',
        data: [0,0,0,0,0,0,0,0,0],
        backgroundColor: '#3498db',
        borderColor: '#3498db',
        type: 'bar',
        yAxisID: 'y',
      },
      {
        label: 'Objectif Annuel',
        data: [10, 15, 12, 8, 20, 10, 30, 7, 5],
        backgroundColor: 'rgba(46,204,113,0.2)',
        borderColor: '#2ecc71',
        type: 'line',
        fill: false,
        yAxisID: 'y',
        borderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  chartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Comparaison Statistiques Réelles vs Objectifs'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantité'
        }
      }
    }
  };

  switchType() {
    this.chartType = this.chartType === 'bar' ? 'line' : 'bar';
    // On force le type de chaque dataset pour un rendu mixte
  this.chartData.datasets[0].type = this.chartType as any;
  this.chartData.datasets[1].type = (this.chartType === 'bar' ? 'line' : 'bar') as any;
  }

  constructor(
    private router: Router,
    private universiteService: UniversityService,
    private filiereService: FiliereService,
    private projetService: ProjetService,
    private categoryService: CategoryService,
    private documentService: DocumentService,
    private collaborateurService: CollaborateurService,
    private userService: UserService,
    private facultyService: FacultyService,
    private niveauService: NiveauService
  ) {}
navigateTo(path: string): void {
  this.router.navigate([`/adminsys/${path}`]);
}
  ngOnInit(): void {

    
    this.universiteService.getUniversities().subscribe(univ => {
      this.data1 = univ;
      this.universityCount = this.data1.length;
      this.updateChartData();
    });

    this.filiereService.getFilieres().subscribe(filiere => {
      this.data2 = filiere;
      this.filiereCount = this.data2.length;
      this.updateChartData();
    });

    this.projetService.getProjects().subscribe(projet => {
      this.data3 = projet;
      this.projetCount = this.data3.length;
      this.updateChartData();
    });
    this.categoryService.getCategories().subscribe(category => {
      this.data4 = category;
      this.categoryCount = this.data4.length;
      this.updateChartData();
    });
    this.documentService.getDocuments().subscribe(document => {
      this.data5 = document;
      this.documentCount = this.data5.length;
      this.updateChartData();
    });
    this.collaborateurService.getCollaborateurs().subscribe(collaborateur => {
      this.data6 = collaborateur;
      this.collaborateurCount = this.data6.length;
      this.updateChartData();
    });
    /*this.userService.getUsers().subscribe(user => {
      this.data7 = user;
      this.userCount = this.data7.length;
      this.updateChartData();
    });*/
    this.facultyService.getFaculties().subscribe(faculty => {
      this.data8 = faculty;
      this.facultyCount = this.data8.length;
      this.updateChartData();
    });
    this.niveauService.getNiveaux().subscribe(niveau => {
      this.data9 = niveau;
      this.niveauCount = this.data9.length;
      this.updateChartData();
    });
  }

  updateChartData(): void {
    this.chartData.datasets[0].data = [
      this.universityCount,
      this.filiereCount,
      this.projetCount,
      this.categoryCount,
      this.documentCount,
      this.collaborateurCount,
      this.userCount,
      this.facultyCount,
      this.niveauCount
    ];
  }
}
