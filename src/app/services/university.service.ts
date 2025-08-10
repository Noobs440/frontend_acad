import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UniversityService {

  constructor(private http:HttpClient){}


  getUniversities(): Observable<any[]>{
    return this.http.get<any[]>('http://localhost:8000/api/ressources/universites').pipe(
      tap((response)=>console.table(response)),
      catchError((error) =>{
        console.log(error);
        return of([]);
      })
    )
  }

  adduniversity(nom_univ:string , email_univ:string , localite_univ:string, boite_postale:string):Observable<any>{
    return this.http.post<any>('http://localhost:8000/api/ressources/universites', {nom_univ , email_univ , localite_univ, boite_postale});
  }

  deleteuniversity(id:string):Observable<any>{
    return this.http.delete(`http://localhost:8000/api/ressources/universites/${id}`);
  }

  updateuniversity(id:string ,nom_univ:string , email_univ:string , localite_univ:string, boite_postale:string):Observable<any>{
    return this.http.put<any>(`http://localhost:8000/api/ressources/universites/${id}`, {nom_univ , email_univ , localite_univ, boite_postale});
  }
}
