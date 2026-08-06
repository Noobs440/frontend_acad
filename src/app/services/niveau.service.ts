
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NiveauService {

    searchNiveaux(query: string): Observable<any[]> {
      return this.http.get<any[]>(`https://dschangschoolhub.ddns.net/api/ressources/niveaux/search?q=${encodeURIComponent(query)}`).pipe(
        catchError((error) => {
        
          return of([]);
        })
      );
    }

  getLevelsWithProjectCount(): Observable<any[]> {
  return this.http.get<any[]>('https://dschangschoolhub.ddns.net/api/usecases/listing/levels-with-project-count');
  }

  constructor(private http:HttpClient){}


  getNiveaux(): Observable<any[]>{
    return this.http.get<any[]>('https://dschangschoolhub.ddns.net/api/ressources/niveaux').pipe(
      
      catchError((error) =>{
        
        return of([]);
      })
    )
  }

  addniveau(code_niv:string ):Observable<any>{
    return this.http.post<any>('https://dschangschoolhub.ddns.net/api/ressources/niveaux', {code_niv});
  }

  deleteniveau(id:string):Observable<any>{
    return this.http.delete(`https://dschangschoolhub.ddns.net/api/ressources/niveaux/${id}`);
  }

  updateniveau(id:string ,code_niv:string ):Observable<any>{
    return this.http.put<any>(`https://dschangschoolhub.ddns.net/api/ressources/niveaux/${id}`, {code_niv});
  }
}
