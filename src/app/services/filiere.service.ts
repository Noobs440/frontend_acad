import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiliereService {

  constructor(private http:HttpClient){}


  getFilieres(): Observable<any[]>{
    return this.http.get<any[]>('https://backend-acad.onrender.com/api/ressources/filieres').pipe(
      tap((response)=>console.table(response)),
      catchError((error) =>{
        console.log(error);
        return of([]);
      })
    )
  }

  addFiliere(nom_fil:string , tbl_faculte_id:string):Observable<any>{
    return this.http.post<any>('https://backend-acad.onrender.com/api/ressources/filieres', {nom_fil , tbl_faculte_id});
  }

  deleteFiliere(id:string):Observable<any>{
    return this.http.delete(`https://backend-acad.onrender.com/api/ressources/filieres/${id}`);
  }

  updateFiliere(id:string ,nom_fil:string , tbl_faculte_id:string):Observable<any>{
    return this.http.put<any>(`https://backend-acad.onrender.com/api/ressources/filieres/${id}`, {nom_fil , tbl_faculte_id});
  }
}
