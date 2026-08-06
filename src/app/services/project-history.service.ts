import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectHistoryService {
  private apiUrl = 'https://dschangschoolhub.ddns.net/api/projects';

  constructor(private http: HttpClient) {}

  getHistory(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${projectId}/history`);
  }
}
