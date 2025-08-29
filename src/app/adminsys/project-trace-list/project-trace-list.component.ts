import { Component, Input, OnInit } from '@angular/core';
import { ProjectTraceService } from '../../services/project-trace.service';

@Component({
  selector: 'app-project-trace-list',
  templateUrl: './project-trace-list.component.html',
  styleUrls: ['./project-trace-list.component.css']
})
export class ProjectTraceListComponent implements OnInit {
  // Pagination
  page = 1;
  pageSize = 12;
  pagedTraces: any[] = [];

  @Input() projectId!: number;
  traces: any[] = [];
  filteredTraces: any[] = [];
  isLoading = false;

  // Champs de recherche/filtre
  searchTerm: string = '';
  filterType: string = '';

  constructor(private traceService: ProjectTraceService) {}

  ngOnInit(): void {
    if (this.projectId) {
      this.isLoading = true;
      this.traceService.getTraces(this.projectId).subscribe({
        next: traces => {
          this.traces = traces;
          this.applyFilters();
        },
        error: err => console.error(err),
        complete: () => this.isLoading = false
      });
    }
  }

  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    const filtered = this.traces.filter(trace => {
      const nom = (trace.user?.nom_user || trace.user?.name || '').toLowerCase();
      const titre = (trace.infos_apres?.titre_projet || trace.infos_avant?.titre_projet || '').toLowerCase();
      const auteurProjet = (trace.infos_apres?.nom_utilisateur || trace.infos_avant?.nom_utilisateur || '').toLowerCase();
      const type = (trace.type_modification || '').toLowerCase();
      let match = true;
      if (term) {
        match = nom.includes(term) || titre.includes(term) || auteurProjet.includes(term);
      }
      if (this.filterType) {
        match = match && type === this.filterType.toLowerCase();
      }
      return match;
    });
    this.filteredTraces = filtered;
    this.page = 1;
    this.updatePagedTraces();
  }

  updatePagedTraces() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedTraces = this.filteredTraces.slice(start, end);
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.updatePagedTraces();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTraces.length / this.pageSize) || 1;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onTypeFilterChange() {
    this.applyFilters();
  }
}
