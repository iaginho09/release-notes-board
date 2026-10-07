import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Application, CreateItemRequest, Item, Status } from '../models/release-notes.model';

/**
 * Thin client for the backend REST API. URLs are relative so the same build works behind
 * the dev-server proxy (see proxy.conf.js) or a reverse proxy in production.
 */
@Injectable({ providedIn: 'root' })
export class ReleaseNotesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.baseUrl}/applications`);
  }

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/items`);
  }

  createItem(request: CreateItemRequest): Observable<Item> {
    return this.http.post<Item>(`${this.baseUrl}/items`, request);
  }

  changeStatus(itemId: number, status: Status): Observable<Item> {
    return this.http.patch<Item>(`${this.baseUrl}/items/${itemId}/status`, { status });
  }
}
