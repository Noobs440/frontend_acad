import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjetstatusService {

  constructor(private http:HttpClient) { }

  approveProject(id:number):Observable<any>{
    return this.http.get<any>(`https://backend-acad.onrender.com/api/usecases/status/approved/pending/${id}`);
  }

  rejectProject(id:number, reason:string):Observable<any>{
    // Utiliser PATCH pour la mise à jour du statut
    return this.http.patch<any>(`https://backend-acad.onrender.com/api/usecases/status/rejected/pending/${id}`,
      { motif: reason }
    );
  }

  pendingProject(id:number):Observable<any>{
    return this.http.get<any>(`https://backend-acad.onrender.com/api/usecases/status/pending/${id}`);
  }


}
