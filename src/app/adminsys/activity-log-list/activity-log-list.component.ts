import { Component, OnInit } from '@angular/core';
import { ActivityLogService, ActivityLog } from '../../services/activity-log.service';

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

  constructor(private activityLogService: ActivityLogService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(page: number = 1): void {
    this.activityLogService.getLogs({}, page, this.perPage).subscribe({
      next: (response) => {
        this.logs = response.data;
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des logs', err);
      }
    });
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
