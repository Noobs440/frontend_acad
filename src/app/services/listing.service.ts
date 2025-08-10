import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ListingService {

  constructor(private http:HttpClient) { }

  getProjectsById(id:any): Observable<any[]>{
    return this.http.get<any[]>(`http://localhost:8000/api/usecases/listing/user/projets/${id}`).pipe(
      tap((response)=>console.table(response)),
      catchError((error) =>{
        console.log(error);
        return of([]);
      })
    )
  }

  getApprovedProjectsById(id:any): Observable<any[]>{
    return this.http.get<any[]>(`http://localhost:8000/api/usecases/listing/user/approved_projets/${id}`).pipe(
      tap((response)=>console.table(response)),
      catchError((error) =>{
        console.log(error);
        return of([]);
      })
    )
  }


}
