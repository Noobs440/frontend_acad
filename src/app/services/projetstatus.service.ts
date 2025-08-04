import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjetstatusService {

  private apiUrl = 'http://localhost:8000/api/usecases/status';

  constructor(private http: HttpClient) { }

  approveProject(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/approved/pending/${id}`);
  }

  rejectProject(id: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/rejected/pending/${id}`, {
      motif: reason
    });
  }

  pendingProject(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pending/${id}`);
  }
}
