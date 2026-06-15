import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacultyService {

  constructor(private http:HttpClient){}


  getFaculties(): Observable<any[]>{
    return this.http.get<any[]>('https://uds-faculte-des-sciences.netlify.app//api/ressources/facultes').pipe(
    
      catchError((error) =>{
        
        return of([]);
      })
    )
  }

  addFaculty(nom_fac:string , email_fac:string , tbl_universite_id:string):Observable<any>{
    return this.http.post<any>('https://uds-faculte-des-sciences.netlify.app//api/ressources/facultes', {nom_fac , email_fac , tbl_universite_id});
  }

  deleteFaculty(id:string):Observable<any>{
    return this.http.delete(`https://uds-faculte-des-sciences.netlify.app//api/ressources/facultes/${id}`);
  }

  updateFaculty(id:string ,nom_fac:string , email_fac:string , tbl_universite_id:string):Observable<any>{
    return this.http.put<any>(`https://uds-faculte-des-sciences.netlify.app//api/ressources/facultes/${id}`, {nom_fac , email_fac , tbl_universite_id});
  }

    getUniversities(): Observable<any[]>{
    return this.http.get<any[]>('https://uds-faculte-des-sciences.netlify.app//api/ressources/universites').pipe(
      
      catchError((error) =>{
        
        return of([]);
      })
    )
  }
}
