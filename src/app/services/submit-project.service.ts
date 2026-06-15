import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SubmitProjectService {

  constructor(private http:HttpClient) { }

  submitProject(projetId: number, adminId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return new Observable(observer => {
      this.http.post<any>(`https://dschangschoolhub.duckdns.org/api/usecases/submit/${projetId}`, null, { headers }).subscribe({
        next: (submitRes) => {
          // Après soumission, associer l'admin
          const body = { admin_id: adminId };
          this.http.post<any>(`https://dschangschoolhub.duckdns.org/api/ressources/projets/${projetId}/assign-admin`, body, { headers }).subscribe({
            next: (assignRes) => {
              observer.next({ submit: submitRes, assign: assignRes });
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }

}
