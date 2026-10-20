import { catchError, EMPTY, map, Observable, throwError } from "rxjs";
import { QueryMap } from "../query-map";
import { RequestData } from "../request-data";
import { ResponseData } from "../response-data";
import { ApiInterface } from "./api-interface";

import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Router } from "@angular/router";

export class CrmApi implements ApiInterface {
  httpClient: HttpClient;
    router: Router;
    token?: string;
    apiUrl: string = '';
    gateway: { [service: string]: string; } = {};

    constructor(httpClient: HttpClient, paramRouter: Router) {
        this.httpClient = httpClient;
        this.router = paramRouter;
        const crmInfo = environment['crmInfo'];
        if (crmInfo) {
            this.token = crmInfo['token'] ?? '';
            this.apiUrl = crmInfo['apiUrl'] ?? '';
            this.gateway = crmInfo['gateway'] ?? {};
        }
    }

    get(api: string, queryMap: QueryMap = new QueryMap()): Observable<ResponseData> {
        return this.httpClient.get<ResponseData>(`${this.apiUrl}${api}${queryMap.toString()}`, {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'Token': this.token ?? ''
            })
          }).pipe(
            map((response: ResponseData) => {
              return response;
            }),
            catchError((error) => {
              if (error.status === 401) {  // 認證失敗導向至 login
                this.router.navigate(['/login']);
                return EMPTY;
              }
              return throwError(() => error);
            }));
    }
    getDownload(api: string, queryMap: QueryMap = new QueryMap()): Observable<ResponseData> {
        return this.httpClient.get(`${this.apiUrl}${api}${queryMap.toString()}`, {
            headers: new HttpHeaders({
              'Token': this.token ?? ''
            }),
            observe: 'response',
            responseType: 'blob'
          }).pipe(
            map((response: HttpResponse<Blob>) => {
              const resData = new ResponseData();
              const contentDisposition = response.headers.get('content-disposition');
              if (contentDisposition !== null) {
                const firstDoubleQuoteIndex = contentDisposition.indexOf('"');
                const lastDoubleQuoteIndex = contentDisposition.indexOf('"', firstDoubleQuoteIndex + 1);
                resData.filename = contentDisposition.substring(firstDoubleQuoteIndex + 1, lastDoubleQuoteIndex);
              }
              if (response.body) {
                resData.blob = response.body;
              }
              return resData;
            })
          );
    }
    post(api: string, data: RequestData | FormData | null = null, queryMap: QueryMap = new QueryMap()): Observable<ResponseData> {
        const headers: { [key: string]: any } = {
            'Token': this.token ?? ''
        };
    
        if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        }
    
        return this.httpClient.post<ResponseData>(`${this.apiUrl}${api}${queryMap.toString()}`, data, {
        headers: new HttpHeaders(headers)
        }).pipe(
        map((response: any) => {
            return response;
        }),
        catchError((error) => {
            if (error.status === 401) {  // 認證失敗導向至 login
                this.router.navigate(['/login']);
                return EMPTY;
            } else {
                const msg = '[Status Code] ' + error.status + '\n\n[Message] ' + error.message;
                return throwError(() => msg);
            }
        }));
    }
    postDownload(api: string, data: RequestData | FormData | null = null, queryMap: QueryMap = new QueryMap()): Observable<ResponseData> {
        const headers: { [key: string]: any } = {
            'Token': this.token ?? ''
          };
      
          if (!(data instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
          }
      
          return this.httpClient.post(`${this.apiUrl}${api}${queryMap.toString()}`, data, {
            headers: new HttpHeaders(headers),
            observe: 'response',
            responseType: 'blob'
          }).pipe(
            map((response: HttpResponse<Blob>) => {
              const resData = new ResponseData();
              const contentDisposition = response.headers.get('content-disposition');
              if (contentDisposition !== null) {
                const firstDoubleQuoteIndex = contentDisposition.indexOf('"');
                const lastDoubleQuoteIndex = contentDisposition.indexOf('"', firstDoubleQuoteIndex + 1);
                resData.filename = contentDisposition.substring(firstDoubleQuoteIndex + 1, lastDoubleQuoteIndex);
              }
              if (response.body) {
                resData.blob = response.body;
              }
              return resData;
            })
          );
    }
    put(api: string, data: RequestData | FormData | null = null, queryMap: QueryMap = new QueryMap()): Observable<ResponseData> {
        const headers: { [key: string]: any } = {
            'Token': this.token ?? ''
          };
      
          if (!(data instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
          }
      
          return this.httpClient.put<ResponseData>(`${this.apiUrl}${api}${queryMap.toString()}`, data, {
            headers: new HttpHeaders(headers)
          }).pipe(
            map((response: any) => {
              return response;
            }),
            catchError((error) => {
              if (error.status === 401) {  // 認證失敗導向至 login
                this.router.navigate(['/login']);
                return EMPTY;
              } else {
                const msg = '[Status Code] ' + error.status + '\n\n[Message] ' + error.message;
                return throwError(() => msg);
              }
            }));
    }
    delete(api: string, queryMap: QueryMap = new QueryMap()) : Observable<ResponseData> {
        return this.httpClient.delete<ResponseData>(`${this.apiUrl}${api}${queryMap.toString()}`, {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'Token': this.token ?? ''
            })
          }).pipe(
            map((response: any) => {
              return response;
            }),
            catchError((error) => {
              if (error.status === 401) {  // 認證失敗導向至 login
                this.router.navigate(['/login']);
                return EMPTY;
              }
              return throwError(() => error);
            }));
    }

}