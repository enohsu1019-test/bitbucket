import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError, map, Observable, EMPTY, tap, of, switchMap } from 'rxjs';
import { ResponseData } from '../models/response-data';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import { ApiInterface } from '../models/apis/api-interface';
import { CrmApi } from '../models/apis/crm-api';
import { DataService } from './data.service';
import { Router } from '@angular/router';
import { RequestData } from '../models/request-data';
import { QueryMap } from '../models/query-map';

// import { Router } from '@angular/router';
// import { ApiInterface } from '../models/apis/api-interface';
// import { DataService } from './data.service';
// import { AlertService } from './alert.service';
// import { TranslateService } from '@ngx-translate/core';
// import { CrmApi } from '../models/apis/crm-api';

// export class ApiService implements ApiInterface {
//     http: HttpClient;
//     router: Router;
//     token? = '';
//     adToken?: string;
//     adTokenExpiredDate?: string;
//     apiUrl: string = '';
//     gateway: {[service: string]: string} = {};
//     otherHosts: {
//       [hostName: string]: ApiInterface
//     } = {};
//     constructor(private httpClient: HttpClient,
//       private dataService: DataService,
//       private paramRouter: Router,
//       private alert: AlertService,
//       private translate: TranslateService,
//     ) {
//       this.http = this.httpClient;
//       this.router = this.paramRouter;
//       this.apiUrl = environment['apiUrl'];
//       this.gateway = environment['gateway'];

//       this.otherHosts['crm'] = new CrmApi(this.httpClient, this.paramRouter);
//     }
@Injectable({
  providedIn: 'root'
})
export class ApiService implements ApiInterface {
  httpClient: HttpClient;
  router: Router;
  token?= '';
  adToken?: string;
  adTokenExpiredDate?: string;
  apiUrl: string = '';
  gateway: { [service: string]: string } = {};
  otherHosts: {
    [hostName: string]: ApiInterface
  } = {};
  setToken(token: any) {
    throw new Error('Method not implemented.');
  }
  parseError(err: any) {
    throw new Error('Method not implemented.');
  }

  constructor(
    private http: HttpClient,
    private dataService: DataService,
    private paramRouter: Router,
  ) {
    this.httpClient = this.http;
    this.router = this.paramRouter;
    this.apiUrl = environment['apiUrl'];
    this.gateway = environment['gateway'];

    this.otherHosts['crm'] = new CrmApi(this.httpClient, this.paramRouter);
  }

  /** 把物件轉成 query string */
  // getQueryStringFromObject(data: any) {
  //   if (!data || _.isEmpty(data)) {
  //     return '';
  //   }

  //   return Object.keys(data).reduce((acc, key, idx) => {
  //     const str = ((idx === 0) ? '' : '&') + key + '=' + encodeURIComponent(JSON.stringify(data[key]));
  //     return acc += str;
  //   }, '');
  // }

  getRefreshTokenIsUpdate(): Observable<true> {
    return new Observable(subscribe => {
      let oldRefreshToken = this.dataService.refreshToken;
      let newRefreshToken = this.dataService.refreshToken;
      console.log(oldRefreshToken);
      console.log(newRefreshToken);

      if (oldRefreshToken && newRefreshToken) {             // 超時後 call API 的情況
        console.log('超時後 call API 的情況');
        const timer = setInterval(() => {
          newRefreshToken = this.dataService.refreshToken;
          if (oldRefreshToken !== newRefreshToken) {
            console.log('oldRefreshToken !== newRefreshToken');
            clearInterval(timer);
            subscribe.next(true);
            subscribe.complete();
          } else {
            oldRefreshToken = newRefreshToken;
          }
        }, 1000);
      } else if (!oldRefreshToken && !newRefreshToken) {    // 重新整理，refreshToken = undefined 情況
        console.log('重新整理，refreshToken = undefined 情況');
        const timer = setInterval(() => {
          newRefreshToken = this.dataService.refreshToken;
          if (oldRefreshToken && newRefreshToken) {
            console.log('oldRefreshToken && newRefreshToken');
            clearInterval(timer);
            subscribe.next(true);
            subscribe.complete();
          } else {
            oldRefreshToken = newRefreshToken;
          }
        }, 1000);
      } else {
        subscribe.next(true);
        subscribe.complete();
      }

      // if (!oldRefreshToken && !newRefreshToken && oldRefreshToken === newRefreshToken) {
      // if (oldRefreshToken === newRefreshToken) {
      //   console.log('oldRefreshToken === newRefreshToken');

      //   const timer = setInterval(() => {
      //     newRefreshToken = this.dataService.refreshToken;
      //     // if (!oldRefreshToken && !newRefreshToken && oldRefreshToken !== newRefreshToken) {
      //     if (oldRefreshToken !== newRefreshToken) {
      //       console.log('oldRefreshToken !== newRefreshToken');

      //       clearInterval(timer);
      //       subscribe.next(true);
      //       subscribe.complete();
      //     } else {
      //       oldRefreshToken = newRefreshToken;
      //     }
      //   }, 1000);
      // } else {
      //   subscribe.next(true);
      //   subscribe.complete();
      // }
    });
  }

  get(api: string): Observable<ResponseData> {
    return this.http.get<ResponseData>(`${environment['apiUrl']}/${api}`).pipe(
      catchError((error) => {
        console.error('[api] get error', error);
        if (error.status === 401) {
          return this.getRefreshTokenIsUpdate();
        }
        const err = error.error?.info?.message || (error.error?.error + ' ' + error.error?.message);
        console.log(err);
        return throwError(() => new Error(err));
      }),
      switchMap(res => {
        console.log(res);
        if (res === true) {
          return this.http.get<ResponseData>(`${environment['apiUrl']}/${api}`);
        } else {
          return of(res);
        }
      }));
  }

  post(api: string, data: any): Observable<ResponseData> {
    return this.http.post<ResponseData>(`${environment['apiUrl']}/${api}`, data).pipe(
      catchError((error) => {
        console.error('[api] post error', error);
        if (error.status === 401) {
          return this.getRefreshTokenIsUpdate();
        }
        const err = error.error?.info?.message || (error.error?.error + ' ' + error.error?.message);
        console.log(err);
        return throwError(() => new Error(err));
      }),
      switchMap(res => {
        console.log(res);
        if (res === true) {
          return this.http.post<ResponseData>(`${environment['apiUrl']}/${api}`, data);
        } else {
          return of(res);
        }
      })
    );
  }

  put(api: string, data: any): Observable<ResponseData> {
    return this.http.put<ResponseData>(`${environment['apiUrl']}/${api}`, data).pipe(
      catchError((error) => {
        console.error('[api] put error', error);
        if (error.status === 401) {
          return this.getRefreshTokenIsUpdate();
        }
        const err = error.error?.info?.message || (error.error?.error + ' ' + error.error?.message);
        return throwError(() => new Error(error));
      }),
      switchMap(res => {
        if (res === true) {
          return this.http.put<ResponseData>(`${environment['apiUrl']}/${api}`, data);
        } else {
          return of(res);
        }
      })
    );
  }

  patch(api: string, data: any): Observable<ResponseData> {
    return this.http.patch<ResponseData>(`${environment['apiUrl']}/${api}`, data).pipe(
      catchError((error) => {
        console.error('[api] put error', error);
        if (error.status === 401) {
          return this.getRefreshTokenIsUpdate();
        }
        const err = error.error?.info?.message || (error.error?.error + ' ' + error.error?.message);
        return throwError(() => new Error(error));
      }),
      switchMap(res => {
        if (res === true) {
          return this.http.patch<ResponseData>(`${environment['apiUrl']}/${api}`, data);
        } else {
          return of(res);
        }
      })
    );
  }

  delete(api: string, data?: any): Observable<ResponseData> {
    return this.http.request<ResponseData>('delete', `${environment['apiUrl']}/${api}`, { body: data }).pipe(
      catchError((error) => {
        console.error('[api] delete error', error);
        if (error.status === 401) {
          return this.getRefreshTokenIsUpdate();
        }
        const err = error.error?.info?.message || (error.error?.error + ' ' + error.error?.message);
        return throwError(() => new Error(error));
      }),
      switchMap(res => {
        if (res === true) {
          return this.http.request<ResponseData>('delete', `${environment['apiUrl']}/${api}`, { body: data });
        } else {
          return of(res);
        }
      })
    );
  }

  public getDownload(api: string): Observable<ResponseData> {
    return this.http.get(`${api}`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map((response: HttpResponse<Blob>) => {
        const resData = new ResponseData();
        const contentDisposition = response.headers.get('content-disposition');
          if (contentDisposition !== null) {
            const filenameIndex = contentDisposition.indexOf('UTF-8\'\'');
            if (filenameIndex !== -1) {
              resData.filename = contentDisposition.substring(filenameIndex + 7, contentDisposition.length);
            }
          }
        if (response.body) {
          resData.blob = response.body;
        }
        return resData;
      }),
      catchError((error) => {
        console.error('[api] delete error', error);
        if (error.status === 401) {
          return this.getRefreshTokenIsUpdate();
        }
        const err = error.error?.info?.message || (error.error?.error + ' ' + error.error?.message);
        return throwError(() => new Error(error));
      }),
      switchMap(res => {
        if (res === true) {
          return this.http.get(`${api}`, {
            observe: 'response',
            responseType: 'blob'
          }).pipe(
            map((response: HttpResponse<Blob>) => {
              const resData = new ResponseData();
              if (response.body) {
                resData.blob = response.body;
              }
              return resData;
            }));
        } else {
          return of(res);
        }
      })
    );
  }

  postDownload(api: string, data: RequestData | FormData | null = null, queryMap: QueryMap = new QueryMap()): Observable<ResponseData> {
    const headers: { [key: string]: any } = {
      'Token': this.token ?? ''
    };

    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    return this.httpClient.post(`${this.apiUrl}/${api}${queryMap.toString()}`, data, {
      headers: new HttpHeaders(headers),
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map((response: HttpResponse<Blob>) => {
        const resData = new ResponseData();
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition !== null) {
          // const firstDoubleQuoteIndex = contentDisposition.indexOf('"');
          // const lastDoubleQuoteIndex = contentDisposition.indexOf('"', firstDoubleQuoteIndex + 1);
          // resData.filename = contentDisposition.substring(firstDoubleQuoteIndex + 1, lastDoubleQuoteIndex);
          const filenameIndex = contentDisposition.indexOf('UTF-8\'\'');
          if (filenameIndex !== -1) {
            resData.filename = contentDisposition.substring(filenameIndex + 7, contentDisposition.length);
          }
        }
        if (response.body) {
          resData.blob = response.body;
        }
        return resData;
      })
    );
  }
}
