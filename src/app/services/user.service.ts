import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject,throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Récupérer tous les superviseurs (table superviseurs Laravel)
  getSupervisors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ressources/superviseurs`, this.getAuthHeaders());
  }
  private apiUrl = environment.backendUrl;

  // Stocke et diffuse les infos utilisateur actuelles
  public userSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}
  inscription(nom_user:string ,email:string, password:string, tbl_filiere_id:string,matricule:string):Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/usecases/auth/inscription` , {nom_user , email , password,tbl_filiere_id, matricule}, { withCredentials: true });}

  /**
   * Récupère les headers d'authentification avec JWT.
   * Retourne un objet compatible avec HttpClient.
   */
  private getAuthHeaders(): { headers?: HttpHeaders } {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        return {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          })
        };
      }
    }
    return {};
  }

  // ----------------------
  // 🔐 AUTHENTIFICATION
  // ----------------------

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usecases/auth/connexion`, { email, password }).pipe(
      tap(response => {
        if (response?.access_token) {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('token', response.access_token);
          }
        }
      }),
      catchError(error => {
        console.error('Erreur de connexion:', error);
        throw error;
        return throwError(() => error); 
      })
    );
  }


  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/deconnexion`, null, this.getAuthHeaders());
  }

  isAuthenticated(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  // ----------------------
  // 📩 MOT DE PASSE / VÉRIFICATION
  // ----------------------

  sendVerificationCode(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/usecases/password/sendcode`,
      { email },
      { withCredentials: true }
    );
  }

  verifycode(email: string, code: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/usecases/auth/verify`,
      { email, code },
      { withCredentials: true }
    );
  }

  verifyResetcode(email: string, verification_code: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/usecases/password/verificationcode`,
      { email, verification_code },
      { withCredentials: true }
    );
  }

  resetPassword(email: string, password: string, verification_code: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/usecases/password/reset`,
      { email, password, verification_code },
      { withCredentials: true }
    );
  }

  // ----------------------
  // 👤 PROFIL UTILISATEUR
  // ----------------------

  /**
   * Charge le profil utilisateur depuis le backend
   * et met à jour le BehaviorSubject.
   */
  loadUserProfile(): void {
    this.http.get<any>(`${this.apiUrl}/user`, this.getAuthHeaders())
      .pipe(
        catchError(err => {
          console.error('Erreur lors du chargement du profil', err);
          return of(null);
        })
      )
      .subscribe(user => {
        this.userSubject.next(user);
      });
  }

  /**
   * Retourne l'observable du profil utilisateur.
   */
  getUserProfile(): Observable<any> {
    return this.userSubject.asObservable();
  }

  updateName(data: { nom_user: string; surname: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/update-name`, data, this.getAuthHeaders());
  }

  updateEmail(data: { email: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/email`, data, this.getAuthHeaders());
  }

  updatePassword(data: { oldPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/update-password`, data, this.getAuthHeaders()).pipe(
      catchError(err => {
        console.error('Erreur update password', err);
        throw err;
      })
    );
  }

  /**
   * Met à jour la photo et met à jour le BehaviorSubject.
   */
  updatePhoto(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/photo`, formData, this.getAuthHeaders()).pipe(
      tap(res => {
        if (res.photo) {
          const currentUser = this.userSubject.value || {};
          this.userSubject.next({ ...currentUser, photo: res.photo });
        }
      }),
      catchError(err => {
        console.error('Erreur update photo', err);
        throw err;
      })
    );
  }
}
