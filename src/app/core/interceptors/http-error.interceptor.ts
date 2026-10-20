import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(catchError(err => {
      console.error('http interceptor', err);
      if (err.status === 401) {
        // auto logout if 401 response returned from api
        // this.authService.logout();
        this.authService.refresh();
      }
      const error = err.error?.info?.message || (err.error?.error + ' ' + err.error?.message);
      return throwError(() => err);
    }));
  }
}
