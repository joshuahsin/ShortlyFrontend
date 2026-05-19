import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUrlRequest, SortDirection, SortField, UrlResponse } from '../models/url.model';

@Injectable({ providedIn: 'root' })
export class UrlService {
  constructor(private http: HttpClient) {}

  createUrl(request: CreateUrlRequest): Observable<UrlResponse> {
    return this.http.post<UrlResponse>('/api/urls', request);
  }

  getUrls(sortBy: SortField = 'createdAt', direction: SortDirection = 'DESC'): Observable<UrlResponse[]> {
    const params = new HttpParams().set('sortBy', sortBy).set('direction', direction);
    return this.http.get<UrlResponse[]>('/api/urls', { params });
  }

  deleteUrl(shortCode: string): Observable<void> {
    return this.http.delete<void>(`/api/urls/${shortCode}`);
  }
}
