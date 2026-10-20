import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokenAuthInterceptor implements HttpInterceptor {
  gateway: any;

  constructor(private authService: AuthService) { this.gateway = environment['gateway']; }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with basic auth credentials if available
    const currentUser = this.authService.currentUserValue;
    const isApiUrl = request.url.startsWith(environment['apiUrl']);

    if (currentUser && currentUser.accessToken && isApiUrl) {

      /* 因為 HttpRequest 內的屬性大多是唯讀的，因此 HttpRequest 額外提供了 clone 方法，用來建立新的請求。 */
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.accessToken}`
        }
      });
    }

    return next.handle(request);
  }
}
