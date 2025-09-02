
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject,throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  getAdmins(): Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUrl}/admins`);
  }
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
        // Charger le profil et notifier
        this.loadUserProfile();
      }
    }),
    catchError(error => {
      console.error('Erreur de connexion:', error);
      return throwError(() => error);
    })
  );
}



logout(): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/deconnexion`, null, this.getAuthHeaders()).pipe(
    tap(() => {
      // Effacer le token
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token');
      }
      // Notifier que l'utilisateur est déconnecté
      this.userSubject.next(null);
    })
  );
}


  isAuthenticated(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return !!localStorage.getItem('token');
  }



isUserLoggedIn$() {
  return this.userSubject.asObservable().pipe(
    map(user => !!user) // true si un utilisateur est présent
  );
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

  verifycode(
  email: string,
  code: string,
  nom_user: string,
  password: string,
  tbl_filiere_id: string,
  matricule: string
): Observable<any> {
  const body = {
    email,
    code,
    nom_user,
    password,
    tbl_filiere_id,
    matricule
  };

  return this.http.post(
    `${this.apiUrl}/usecases/auth/verify`,
    body
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
      
      catchError(err => {
      
        throw err;
      })
    );
  }

getCurrentUserId(): number | null {
  const user = this.userSubject.value;
  return user ? user.id : null;
}

getCurrentUserName(): string | null {
  const user = this.userSubject.value;
  return user ? user.nom_user || user.name || null : null;
}

getUserCommentConversations(userId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/comment-conversations`);
}
}
