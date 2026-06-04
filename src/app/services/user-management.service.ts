 

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  private API_BASE = 'http://localhost:8000/api/user-management';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.API_BASE);
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(this.API_BASE, user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put<any>(`${this.API_BASE}/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.API_BASE}/${id}`);
  }
    searchUsers(term: string): Observable<any[]> {
    if (!term.trim()) {
      return new Observable<any[]>(observer => observer.next([]));
    }
    return this.http.get<any[]>(`${this.API_BASE}?search=${encodeURIComponent(term)}`);
  }

searchUsersByEmail(term: string): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:8000/api/users?role=user&search=${encodeURIComponent(term)}`);
}



    getFilieres(): Observable<any[]>{
      return this.http.get<any[]>('http://localhost:8000/api/ressources/filieres').pipe(
        
        catchError((error) =>{
          
          return of([]);
        })
      )
    }
    resetPassword(userId: number, newPassword: string) {
  return this.http.put(`${this.API_BASE}/${userId}/reset-password`, {
    password: newPassword
  });
}
 /**
   * Recherche un utilisateur par email (filtrage côté front)
   */
  findUserByEmail(email: string): Observable<any | null> {
    return this.getUsers().pipe(
      map((users: any[]) => {
        const found = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        return found || null;
      })
    );
  }
}
