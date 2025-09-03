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
    return this.http.get<any[]>('https://backend-acad.onrender.com/api/usecases/acceuil/projets/ordre').pipe(
      
      catchError((error) =>{
  
        return of([]);
      })
    )
  }

  getCategoriesWithProjectNumber(): Observable<any[]>{
    return this.http.get<any[]>('https://backend-acad.onrender.com/api/usecases/acceuil/categories').pipe(
      
      catchError((error) =>{
        
        return of([]);
      })
    )
  }
}
