
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  constructor(private http: HttpClient) { }

  // Récupère les projets où l'utilisateur est collaborateur (lecture seule)
  getProjectsByCollaboratorId(id: any): Observable<any[]> {
    return this.http.get<any[]>(`https://dschangschoolhub.duckdns.org/api/usecases/listing/collaborateur/projets/${id}`).pipe(
      catchError(() => of([]))
    );
  }

  getProjectsById(id: any): Observable<any[]> {
    return this.http.get<any[]>(`https://dschangschoolhub.duckdns.org/api/usecases/listing/user/projets/${id}`).pipe(
      catchError(() => of([]))
    );
  }

  getApprovedProjectsById(id: any): Observable<any[]> {
    return this.http.get<any[]>(`https://dschangschoolhub.duckdns.org/api/usecases/listing/user/approved_projets/${id}`).pipe(
      catchError(() => of([]))
    );
  }
}
