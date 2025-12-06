// src/app/core/services/https.service.ts
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environtment'

export interface ApiOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  queryParams?: { [key: string]: any };
  resourceParams?: { [key: string]: string | number };
  body?: any;
  headers?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class Https {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  request<T>(endpoint: string, options: ApiOptions) {
    const url = this.buildUrl(endpoint, options.resourceParams);
    const params = this.buildHttpParams(options.queryParams);
    const headers = new HttpHeaders(options.headers || {});

    switch (options.method.toUpperCase()) {
      case 'GET':
        return this.http.get<T>(url, { params, headers });

      case 'POST':
        return this.http.post<T>(url, options.body || {}, { params, headers });

      case 'PUT':
        return this.http.put<T>(url, options.body || {}, { params, headers });

      case 'PATCH':
        return this.http.patch<T>(url, options.body || {}, { params, headers });

      case 'DELETE':
        return this.http.delete<T>(url, { params, headers });

      default:
        throw new Error(`Unsupported HTTP method: ${options.method}`);
    }
  }

  private buildUrl(endpoint: string, resourceParams?: ApiOptions['resourceParams']): string {
    let url = this.baseUrl + endpoint;
    if (resourceParams) {
      for (const key in resourceParams) {
        url = url.replace(`:${key}`, encodeURIComponent(resourceParams[key]));
      }
    }
    return url;
  }

  private buildHttpParams(queryParams?: ApiOptions['queryParams']): HttpParams {
    let params = new HttpParams();
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params = params.set(key, value);
        }
      });
    }
    return params;
  }
}
