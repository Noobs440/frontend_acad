import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http:HttpClient , private router:Router) { }

  getCategories(): Observable<any[]>{
    return this.http.get<any[]>('http://localhost:8000/api/ressources/categories').pipe(
      tap((response)=>console.table(response)),
      catchError((error) =>{
        console.log(error);
        return of([]);
      })
    )
  }

  addCategory(nom_cat:string , descript_cat:string, icone:string):Observable<any>{
    return this.http.post<any>('http://localhost:8000/api/ressources/categories', {nom_cat , descript_cat, icone});
  }

  deleteCategory(id:string):Observable<any>{
    return this.http.delete(`http://localhost:8000/api/ressources/categories/${id}`);
  }

  updateCategory(id:string ,nom_cat:string , descript_cat:string, icone:string):Observable<any>{
    return this.http.put<any>(`http://localhost:8000/api/ressources/categories/${id}`, {nom_cat , descript_cat, icone});
  }
addCategoryMultipart(formData: FormData) {
  return this.http.post<any>('http://localhost:8000/api/ressources/categories', formData);
}

updateCategoryMultipart(id: number, formData: FormData) {
  formData.append('_method', 'PUT'); // important !
  return this.http.post<any>(`http://localhost:8000/api/ressources/categories/${id}`, formData);
}



}
