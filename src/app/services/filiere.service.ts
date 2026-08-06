import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiliereService {

  constructor(private http:HttpClient){}


  getFilieres(): Observable<any[]>{
    return this.http.get<any[]>('https://dschangschoolhub.ddns.net/api/ressources/filieres').pipe(
      
      catchError((error) =>{
        
        return of([]);
      })
    )
  }

  addFiliere(nom_fil:string , tbl_faculte_id:string):Observable<any>{
    return this.http.post<any>('https://dschangschoolhub.ddns.net/api/ressources/filieres', {nom_fil , tbl_faculte_id});
  }

  deleteFiliere(id:string):Observable<any>{
    return this.http.delete(`https://dschangschoolhub.ddns.net/api/ressources/filieres/${id}`);
  }

  updateFiliere(id:string ,nom_fil:string , tbl_faculte_id:string):Observable<any>{
    return this.http.put<any>(`https://dschangschoolhub.ddns.net/api/ressources/filieres/${id}`, {nom_fil , tbl_faculte_id});
  }

    getFaculties(): Observable<any[]>{
    return this.http.get<any[]>('https://dschangschoolhub.ddns.net/api/ressources/facultes').pipe(
  
      catchError((error) =>{
        
        return of([]);
      })
    )
  }
}
