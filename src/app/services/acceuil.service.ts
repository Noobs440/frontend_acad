import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AcceuilService {

  constructor(private http:HttpClient , private router:Router) { }

  getProjectsByOrder(): Observable<any[]>{
    return this.http.get<any[]>('http://localhost:8000/api/usecases/acceuil/projets/ordre').pipe(
      tap((response)=>console.table(response)),
      catchError((error) =>{
        console.log(error);
        return of([]);
      })
    )
  }

  getCategoriesWithProjectNumber(): Observable<any[]>{
    return this.http.get<any[]>('http://localhost:8000/api/usecases/acceuil/categories').pipe(
      tap((response)=>console.table(response)),
      catchError((error) =>{
        console.log(error);
        return of([]);
      })
    )
  }
}
