import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RechercheService {

  constructor(private http:HttpClient) { }

  searchProjects(query: string): Observable<any> {
    return this.http.post<any>('http://localhost:8000/api/usecases/search/projets', { query });
  }

  searchProjectsCategories(query: string): Observable<any> {
    return this.http.post<any>('http://localhost:8000/api/usecases/search/projets/categorie', { query });
  }
}
