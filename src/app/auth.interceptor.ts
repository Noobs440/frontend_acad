import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  console.log('HTTP Request to:', req.url);

  let token: string | null = null;

  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('token');
  }

  const cloned = token ? req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  }) : req;

  return next.handle(cloned).pipe(
    tap({
      next: event => console.log('HTTP Response from:', req.url),
      error: error => console.error('HTTP Error from:', req.url, error)
    })
  );
}

}
