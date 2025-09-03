import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UniversityService {

  constructor(private http:HttpClient){}


  getUniversities(): Observable<any[]>{
    return this.http.get<any[]>('https://backend-acad.onrender.com/api/ressources/universites').pipe(
      
      catchError((error) =>{
        
        return of([]);
      })
    )
  }

  adduniversity(nom_univ:string , email_univ:string , localite_univ:string, boite_postale:string):Observable<any>{
    return this.http.post<any>('https://backend-acad.onrender.com/api/ressources/universites', {nom_univ , email_univ , localite_univ, boite_postale});
  }

  deleteuniversity(id:string):Observable<any>{
    return this.http.delete(`https://backend-acad.onrender.com/api/ressources/universites/${id}`);
  }

  updateuniversity(id:string ,nom_univ:string , email_univ:string , localite_univ:string, boite_postale:string):Observable<any>{
    return this.http.put<any>(`https://backend-acad.onrender.com/api/ressources/universites/${id}`, {nom_univ , email_univ , localite_univ, boite_postale});
  }
}
