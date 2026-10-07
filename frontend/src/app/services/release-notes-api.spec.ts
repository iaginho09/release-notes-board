import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ReleaseNotesApi } from './release-notes-api';

describe('ReleaseNotesApi', () => {
  let api: ReleaseNotesApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ReleaseNotesApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should create an item with POST /api/items', () => {
    api.createItem({ applicationId: 1, title: 'New login page' }).subscribe();

    const request = httpTesting.expectOne('/api/items');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ applicationId: 1, title: 'New login page' });
    request.flush({});
  });

  it('should change the status with PATCH /api/items/{id}/status', () => {
    api.changeStatus(7, 'PUBLISHED').subscribe();

    const request = httpTesting.expectOne('/api/items/7/status');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'PUBLISHED' });
    request.flush({});
  });
});
