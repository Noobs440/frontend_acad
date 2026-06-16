import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface Superviseur {
  id?: number;
  nom_sup: string;
  email_sup: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuperviseurService {

  private apiBaseUrl = 'https://dschangschoolhub.duckdns.org/api/ressources/superviseurs';

  constructor(private http: HttpClient) {}

  // Récupérer tous les superviseurs
  getSuperviseurs(): Observable<Superviseur[]> {
    return this.http.get<Superviseur[]>(this.apiBaseUrl).pipe(
      
      catchError(error => {
        
        return throwError(() => error);
      })
    );
  }

  // Ajouter un nouveau superviseur (sans lien projet)
  addSuperviseur(nom_sup: string, email_sup: string): Observable<Superviseur> {
    return this.http.post<Superviseur>(this.apiBaseUrl, { nom_sup, email_sup });
  }

  // Supprimer un superviseur par id
  deleteSuperviseur(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/${id}`);
  }

  // Mettre à jour un superviseur par id
  updateSuperviseur(id: string | number, nom_sup: string, email_sup: string): Observable<Superviseur> {
    return this.http.put<Superviseur>(`${this.apiBaseUrl}/${id}`, { nom_sup, email_sup });
  }

  
}
