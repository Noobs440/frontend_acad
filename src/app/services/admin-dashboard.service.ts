import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface DashboardStats {
  universities: number;
  filieres: number;
  projets: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  private apiUrl = 'https://ton-backend-render.onrender.com/api/admin/dashboard-stats';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.apiUrl);
  }
}
