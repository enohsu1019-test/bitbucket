import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { QueryMap } from "../query-map";
import { RequestData } from "../request-data";
import { ResponseData } from "../response-data";

export interface ApiInterface {
    httpClient: HttpClient;
    router: Router;
    token?: string;
    apiUrl: string;
    gateway: {[service: string]: string};
    get(api: string, queryMap?: QueryMap): Observable<ResponseData>;
    getDownload(api: string, queryMap?: QueryMap): Observable<ResponseData>;
    post(api: string, data?: RequestData | FormData | null, queryMap?: QueryMap): Observable<ResponseData>;
    postDownload(api: string, data?: RequestData | FormData | null, queryMap?: QueryMap): Observable<ResponseData>;
    put(api: string, data?: RequestData | FormData | null, queryMap?: QueryMap): Observable<ResponseData>; 
    delete(api: string, queryMap?: QueryMap): Observable<ResponseData>;
}