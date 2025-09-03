import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectHistoryService {
  private apiUrl = 'https://backend-acad.onrender.com/api/projects';

  constructor(private http: HttpClient) {}

  getHistory(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${projectId}/history`);
  }
}
