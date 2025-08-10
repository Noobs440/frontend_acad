import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NiveauService {

  constructor(private http:HttpClient){}


  getNiveaux(): Observable<any[]>{
    return this.http.get<any[]>('http://localhost:8000/api/ressources/niveaux').pipe(
      tap((response)=>console.table(response)),
      catchError((error) =>{
        console.log(error);
        return of([]);
      })
    )
  }

  addniveau(code_niv:string ):Observable<any>{
    return this.http.post<any>('http://localhost:8000/api/ressources/niveaux', {code_niv});
  }

  deleteniveau(id:string):Observable<any>{
    return this.http.delete(`http://localhost:8000/api/ressources/niveaux/${id}`);
  }

  updateniveau(id:string ,code_niv:string ):Observable<any>{
    return this.http.put<any>(`http://localhost:8000/api/ressources/niveaux/${id}`, {code_niv});
  }
}
