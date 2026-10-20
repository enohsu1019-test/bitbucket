import {
    HTTP_INTERCEPTORS, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor,
    HttpRequest
  } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Router } from '@angular/router';
  import { Observable, throwError, EMPTY } from 'rxjs';
  import { catchError } from 'rxjs/operators';
  
  /**
   * 這個 service 可以在不更動其他元件情況下，攔截網頁 404 狀態。
   * 可用於 404 發生時，自動轉址到 /page-not-found 等 route。
   * 使用時，必須將 'HttpErrorInterceptorProvider' 加入到 app.module.ts 的 providers 陣列。
   * [ref] https://medium.com/@antwaneb/catch-and-handle-all-404-errors-from-your-webservice-in-angular-5-2269b717d78f
   */
  @Injectable()
  export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private router: Router) {
      // console.error('404 interceptor construct...');
    }
  
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      return next.handle(req)
        .pipe(
          catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 404) {
              console.error('404 intercepted by HttpErrorInterceptor!');
              // Add code to redirect to /page-not-found page here
              // ...
              return EMPTY;
            } else {
              return throwError(error);
            }
          })
        );
    }
  }
  
  export const HttpErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpErrorInterceptor,
    multi: true,
  };
  