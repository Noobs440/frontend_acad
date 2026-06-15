import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Collaborateur {
  id?: number;
  nom_collab: string;
  email_collab: string;
  tbl_projet_id?: number;
  projet?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CollaborateurService {

  private apiUrl = 'https://uds-faculte-des-sciences.netlify.app//api/ressources/collaborateurs';

  constructor(private http: HttpClient) {}

  getCollaborateurs(): Observable<Collaborateur[]> {
    return this.http.get<Collaborateur[]>(this.apiUrl).pipe(

      catchError(error => {
        
        return of([]);
      })
    );
  }

  // Ajout collaborateur via endpoint usecases/add/collaborateur/projet/{id}
  addCollaborateur(nom_collab: string, email_collab: string, projet_id: string, user_id: number): Observable<any> {
    return this.http.post<any>(`https://uds-faculte-des-sciences.netlify.app//api/usecases/add/collaborateur/projet/${projet_id}`, { nom_collab, email_collab, user_id });
  }

  deleteCollaborateur(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

updateCollaborateur(id: number, nom_collab:string, email_collab:string, tbl_projet_id:number, user_id:number): Observable<any> {
  return this.http.put<any>(`https://uds-faculte-des-sciences.netlify.app//api/ressources/collaborateurs/${id}`,{nom_collab,email_collab,tbl_projet_id,user_id });
}

   getCollaborateursByProject(id:number): Observable<any[]>{
    return this.http.get<any[]>(`https://uds-faculte-des-sciences.netlify.app//api/usecases/listing/projet/collaborateurs/${id}`).pipe(
      
      catchError((error) =>{
        
        return of([]);
      })
    )
  }
}
