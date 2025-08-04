import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SubmitProjectService {

  constructor(private http:HttpClient) { }

  submitProject(projetId: number, supervisorId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // 1. Soumettre le projet (logique métier, notification admin, etc.)
    // 2. Associer le superviseur
    return new Observable(observer => {
      this.http.post<any>(`http://localhost:8000/api/usecases/submit/${projetId}`, null, { headers }).subscribe({
        next: (submitRes) => {
          // Après soumission, associer le superviseur
          const body = { supervisor_id: supervisorId };
          this.http.post<any>(`http://localhost:8000/api/projects/${projetId}/assign-supervisor`, body, { headers }).subscribe({
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
