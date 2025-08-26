import { Component, OnInit } from '@angular/core';
import { ActivityLogService, ActivityLog } from '../../services/activity-log.service';
import { normalizeString } from '../../utils/string-utils';

@Component({
  selector: 'app-activity-log-list',
  templateUrl: './activity-log-list.component.html',
  styleUrls: ['./activity-log-list.component.css']
})
export class ActivityLogListComponent implements OnInit {
  logs: ActivityLog[] = [];
  currentPage = 1;
  totalPages = 1;
  perPage = 20;
  pageSize = 5;

  filters = {
    action: '',
    resource: '',
    changes: ''
  };

  filteredLogs: ActivityLog[] = [];

  constructor(private activityLogService: ActivityLogService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  applyFilters(): void {
    let temp = this.logs;

    // Apply search filters
    if (this.filters.action) {
      temp = temp.filter(log =>
        normalizeString(log.event).includes(normalizeString(this.filters.action))
      );
    }
    if (this.filters.resource) {
      temp = temp.filter(log =>
        normalizeString(this.getResourceLabel(log)).includes(normalizeString(this.filters.resource))
      );
    }
    if (this.filters.changes) {
      temp = temp.filter(log =>
        normalizeString(this.getChanges(log)).includes(normalizeString(this.filters.changes))
      );
    }

    // Apply pagination
    this.totalPages = Math.ceil(temp.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;

    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredLogs = temp.slice(start, start + this.pageSize);
  }

  loadLogs(page: number = 1): void {
    this.activityLogService.getLogs({}, page, this.perPage).subscribe({
      next: (response) => {
        this.logs = response.data;
        this.filteredLogs = [...this.logs];
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des logs', err);
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilters();
  }

  getResourceLabel(log: any): string {
  if (!log.subject_type) return 'Système';
  const type = log.subject_type.split('\\').pop(); // enlève le namespace
  if (log.new_values?.titre_projet) return `${type} : ${log.new_values.titre_projet}`;
  if (log.new_values?.nom_cat) return `${type} : ${log.new_values.nom_cat}`;
  if (log.new_values?.name) return `${type} : ${log.new_values.name}`;
  return type;
}

getChanges(log: any): string {
  if (!log.old_values && !log.new_values) return '';
  const oldKeys = log.old_values ? Object.keys(log.old_values) : [];
  const changes = oldKeys.map(k => {
    return `${k}: "${log.old_values[k]}" → "${log.new_values[k]}"`;
  });
  return changes.join(', ');
}

}
