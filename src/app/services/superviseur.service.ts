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

  private apiBaseUrl = 'http://localhost:8000/api/ressources/superviseurs';

  constructor(private http: HttpClient) {}

  // Récupérer tous les superviseurs
  getSuperviseurs(): Observable<Superviseur[]> {
    return this.http.get<Superviseur[]>(this.apiBaseUrl).pipe(
      tap(response => console.table(response)),
      catchError(error => {
        console.error('Erreur lors de la récupération des superviseurs :', error);
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

  // Ajouter un superviseur à un projet avec envoi d'email (endpoint spécifique)
  addSuperviseurToProject(projectId: number, data: { nom: string; email: string }): Observable<any> {
    const url = `http://localhost:8000/api/superviseurs/add-to-project/${projectId}`;
    return this.http.post<any>(url, data).pipe(
      tap(response => console.log('Superviseur ajouté au projet avec succès :', response)),
      catchError(error => {
        console.error('Erreur lors de l’ajout du superviseur au projet :', error);
        return throwError(() => error);
      })
    );
  }
}
