import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacultyService {

  constructor(private http:HttpClient){}


  getFaculties(): Observable<any[]>{
    return this.http.get<any[]>('http://localhost:8000/api/ressources/facultes').pipe(
      tap((response)=>console.table(response)),
      catchError((error) =>{
        console.log(error);
        return of([]);
      })
    )
  }

  addFaculty(nom_fac:string , email_fac:string , tbl_universite_id:string):Observable<any>{
    return this.http.post<any>('http://localhost:8000/api/ressources/facultes', {nom_fac , email_fac , tbl_universite_id});
  }

  deleteFaculty(id:string):Observable<any>{
    return this.http.delete(`http://localhost:8000/api/ressources/facultes/${id}`);
  }

  updateFaculty(id:string ,nom_fac:string , email_fac:string , tbl_universite_id:string):Observable<any>{
    return this.http.put<any>(`http://localhost:8000/api/ressources/facultes/${id}`, {nom_fac , email_fac , tbl_universite_id});
  }
}
