  // ✅ Resoumettre un projet rejeté (endpoint dédié)
  
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
// ...existing code...

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
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
  assignSupervisorToProject(projectId: number, supervisorId: string): Observable<any> {
    return this.http.post(`${this.API_BASE}/projects/${projectId}/assign-supervisor`, { supervisorId });
  }
  // Assigner un admin à un projet existant
  assignAdminToProject(projectId: number, adminId: string): Observable<any> {
    return this.http.post(`${this.API_BASE}/ressources/projets/${projectId}/assign-admin`, { admin_id: adminId });
  }

  private API_BASE = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // ✅ Récupérer tous les projets
  getProjects(): Observable<any> {
    return this.http.get(`${this.API_BASE}/ressources/projets`);
  }

  // ✅ Incrémenter les vues d’un projet
  countViews(id: any): Observable<any> {
    return this.http.get(`${this.API_BASE}/usecases/addview/${id}`);
  }

  // ✅ Modifier le statut d’un projet
  updateProjectStatus(projectId: number, status: string): Observable<any> {
    return this.http.patch(`${this.API_BASE}/usecases/status/projects/${projectId}`, { status });
  }

  // ✅ Récupérer les types de projet (Projet, Mémoire, Article, etc.)
  getProjectsTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/usecases/listing/getprojectstype`).pipe(
      tap((response) => console.table(response)),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  // ✅ Ajouter un projet (FormData pour l’upload d’image)
  addProject(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/ressources/projets`, formData);
  }

  // ✅ Supprimer un projet
  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.API_BASE}/ressources/projets/${id}`);
  }

  // ✅ Modifier un projet existant
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
}
