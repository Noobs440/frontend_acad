  // ✅ Resoumettre un projet rejeté (endpoint dédié)
  
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
// ...existing code...

@Injectable({
  providedIn: 'root'
})
export class ProjetService {

  // Soumettre un projet (passe en attente si conditions backend OK)
  submitProject(id: number) {
    return this.http.post(`${this.API_BASE}/usecases/submit/${id}`, {});
  }
  // Rejeter un projet avec un motif
  rejectProjectWithReason(projectId: number, reason: string): Observable<any> {
    return this.http.post(`${this.API_BASE}/ressources/projets/${projectId}/reject`, { rejection_reason: reason });
  }
  // Récupérer les projets supervisés par email
  getSupervisedProjectsByEmail(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/projects/supervised-by-email?email=${encodeURIComponent(email)}`);
  }
  // Récupérer les projets supervisés par l'utilisateur connecté
  getSupervisedProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/projects/supervised`);
  }
  // Assigner un superviseur à un projet
 
  // Assigner un admin à un projet existant
  assignAdminToProject(projectId: number, adminId: string): Observable<any> {
    return this.http.post(`${this.API_BASE}/ressources/projets/${projectId}/assign-admin`, { admin_id: adminId });
  }

  private API_BASE = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<any> {
    return this.http.get(`${this.API_BASE}/ressources/projets`);
  }

  getAllProjects(): Observable<any> {
    return this.http.get(`${this.API_BASE}/projects`);
  }

  countViews(id: any): Observable<any> {
    return this.http.get(`${this.API_BASE}/usecases/addview/${id}`);
  }

  updateProjectStatus(projectId: number, status: string): Observable<any> {
    return this.http.put(`${this.API_BASE}/usecases/status/projects/${projectId}`, { status });
  }
  getProjectsTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/usecases/listing/getprojectstype`).pipe(
      tap((response) => console.table(response)),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  addProject(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/ressources/projets`, formData);
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.API_BASE}/ressources/projets/${id}`);
  }


  updateProject(
    id: string,
    titre_projet: string,
    descript_projet: string,
    user_id: string,
    tbl_niveau_id: string,
    tbl_categorie_id: string
  ): Observable<any> {
    return this.http.put<any>(`${this.API_BASE}/ressources/projets/${id}`, {
      titre_projet,
      descript_projet,
      user_id,
      tbl_niveau_id,
      tbl_categorie_id
    });
  }

  updateProjectWithFormData(id: string, formData: FormData): Observable<any> {
  return this.http.post<any>(`${this.API_BASE}/ressources/projets/${id}`, formData);
}

searchProjectsByTitle(term: string): Observable<any[]> {
  return this.http.get<any[]>(`/api/projects?search=${term}`);
}

getProjectById(id: number) {
  return this.http.get<any>(`${this.API_BASE}/ressources/projets/${id}`);
}

resubmitProject(id: number): Observable<any> {
    return this.http.post(`${this.API_BASE}/ressources/projets/${id}/resubmit`, {});
  }

  // ✅ Compter les projets par statut (utile pour les stats ou dashboard)
  countProjectsByStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/usecases/listing/count`).pipe(
      tap((response) => console.table(response)),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }
  getNiveaux(): Observable<any[]>{
    return this.http.get<any[]>('http://localhost:8000/api/ressources/niveaux').pipe(
      tap((response)=>console.table(response)),
      catchError((error) =>{
        console.log(error);
        return of([]);
      })
    )
  }

getCategories(): Observable<any[]>{
    return this.http.get<any[]>('http://localhost:8000/api/ressources/categories').pipe(
      tap((response)=>console.table(response)),
      catchError((error) =>{
        console.log(error);
        return of([]);
      })
    )
  }
}
