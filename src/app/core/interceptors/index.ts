/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './http-error.interceptor';
import { TokenAuthInterceptor } from './token-auth.interceptor';


/** Http interceptor providers in outside-in order */
export const interceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: TokenAuthInterceptor, multi: true },
];
