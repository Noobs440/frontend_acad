import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjetstatusService {

  constructor(private http:HttpClient) { }

  approveProject(id:number):Observable<any>{
    return this.http.get<any>(`http://localhost:8000/api/usecases/status/approved/pending/${id}`);
  }

  rejectProject(id:number):Observable<any>{
    return this.http.get<any>(`http://localhost:8000/api/usecases/status/rejected/pending/${id}`);
  }

  pendingProject(id:number):Observable<any>{
    return this.http.get<any>(`http://localhost:8000/api/usecases/status/pending/${id}`);
  }


}
