import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Collaborateur {
  id?: number;
  nom_collab: string;
  email_collab: string;
}

@Injectable({
  providedIn: 'root'
})
export class CollaborateurService {

  private apiUrl = 'http://localhost:8000/api/ressources/collaborateurs';

  constructor(private http: HttpClient) {}

  getCollaborateurs(): Observable<Collaborateur[]> {
    return this.http.get<Collaborateur[]>(this.apiUrl).pipe(
      tap(response => console.table(response)),
      catchError(error => {
        console.error('Erreur lors de la récupération des collaborateurs:', error);
        return of([]);
      })
    );
  }

  addCollaborateur(nom_collab:string , email_collab:string,tbl_projet_id:string, user_id:string):Observable<any>{
    return this.http.post<any>('http://localhost:8000/api/ressources/collaborateurs', {nom_collab , email_collab, tbl_projet_id, user_id});
  }

  deleteCollaborateur(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

updateCollaborateur(id: number, nom_collab:string, email_collab:string, tbl_projet_id:number, user_id:number): Observable<any> {
  return this.http.put<any>(`http://localhost:8000/api/ressources/collaborateurs/${id}`,{nom_collab,email_collab,tbl_projet_id,user_id });
}

   getCollaborateursByProject(id:number): Observable<any[]>{
    return this.http.get<any[]>(`http://localhost:8000/api/usecases/listing/projet/collaborateurs/${id}`).pipe(
      tap((response)=>console.table(response)),
      catchError((error) =>{
        console.log(error);
        return of([]);
      })
    )
  }
}
