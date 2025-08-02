import { Component, OnInit } from '@angular/core';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  universityCount = 0;
  filiereCount = 0;
  projetCount = 0;

  barChartLabels: string[] = ['Universités', 'Filières', 'Projets'];

  // ✅ Définition correcte des données pour Chart.js
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: this.barChartLabels,
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Nombre'
      }
    ]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true
      }
    }
  };

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardStats().subscribe(data => {
      this.universityCount = data.universities;
      this.filiereCount = data.filieres;
      this.projetCount = data.projets;

      this.barChartData.datasets[0].data = [
        this.universityCount,
        this.filiereCount,
        this.projetCount
      ];
    });
  }
}
