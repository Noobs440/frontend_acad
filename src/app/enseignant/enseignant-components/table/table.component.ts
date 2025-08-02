import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ProjetService } from '../../../services/projet.service';

interface Project {
  sn: number;
  title: string;
  author: string;
  image: string;
  status: string;
  action: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['sn', 'title', 'author', 'image', 'status', 'action'];
  dataSource = new MatTableDataSource<Project>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private router: Router, private projetService: ProjetService) {}

  ngOnInit() {
    this.projetService.getProjects().subscribe(projets => {
      this.dataSource.data = projets;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  showDetail(element: Project) {
    this.router.navigate(['/enseignant/dashboard/project-detail', element.sn], { queryParams: { title: element.title } });
  }
}
