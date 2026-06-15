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
    return this.http.get<any[]>('https://dschangschoolhub.duckdns.org/api/ressources/categories').pipe(
      
      catchError((error) =>{
        
        return of([]);
      })
    )
  }

  addCategory(nom_cat:string , descript_cat:string, icone:string):Observable<any>{
    return this.http.post<any>('https://dschangschoolhub.duckdns.org/api/ressources/categories', {nom_cat , descript_cat, icone});
  }

  deleteCategory(id:string):Observable<any>{
    return this.http.delete(`https://dschangschoolhub.duckdns.org/api/ressources/categories/${id}`);
  }

  updateCategory(id:string ,nom_cat:string , descript_cat:string, icone:string):Observable<any>{
    return this.http.put<any>(`https://dschangschoolhub.duckdns.org/api/ressources/categories/${id}`, {nom_cat , descript_cat, icone});
  }
addCategoryMultipart(formData: FormData) {
  return this.http.post<any>('https://dschangschoolhub.duckdns.org/api/ressources/categories', formData);
}

updateCategoryMultipart(id: number, formData: FormData) {
  formData.append('_method', 'PUT'); // important !
  return this.http.post<any>(`https://dschangschoolhub.duckdns.org/api/ressources/categories/${id}`, formData);
}



}
