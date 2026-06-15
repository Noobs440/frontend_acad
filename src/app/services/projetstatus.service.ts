import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { ProjetService } from './projet.service';

@Injectable({
  providedIn: 'root'
})
export class ProjetstatusService {

  constructor(private http:HttpClient, private projetService: ProjetService) { }

  approveProject(id:number, reason:string):Observable<any>{
    return this.http.patch<any>(`https://dschangschoolhub.duckdns.org/api/usecases/status/approved/pending/${id}`,
      {motif:reason}).pipe(
      tap(() => this.projetService.notifyProjectChanged(id))
    );
  }

  rejectProject(id:number, reason:string):Observable<any>{
    // Utiliser PATCH pour la mise à jour du statut
    return this.http.patch<any>(`https://dschangschoolhub.duckdns.org/api/usecases/status/rejected/pending/${id}`,
      { motif: reason }
    ).pipe(
      tap(() => this.projetService.notifyProjectChanged(id))
    );
  }

    pendingProject(id:number, reason:string):Observable<any>{
    return this.http.patch<any>(`https://dschangschoolhub.duckdns.org/api/usecases/status/pending/${id}`,
      {motif:reason}).pipe(
      tap(() => this.projetService.notifyProjectChanged(id))
    );
  }


}
