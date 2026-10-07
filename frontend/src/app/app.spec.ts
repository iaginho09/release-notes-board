import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { Item } from './models/release-notes.model';

const ITEM: Item = {
  id: 1,
  applicationId: 1,
  applicationName: 'Customer Portal',
  title: 'New login page',
  description: null,
  version: '1.2.0',
  status: 'DRAFT',
  createdAt: '2026-10-07T08:00:00Z',
  updatedAt: '2026-10-07T08:00:00Z',
};

describe('App', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should load and render applications and items', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    httpTesting.expectOne('/api/applications').flush([{ id: 1, name: 'Customer Portal' }]);
    httpTesting.expectOne('/api/items').flush([ITEM]);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Release Notes Board');
    expect(compiled.querySelector('tbody')?.textContent).toContain('New login page');
    expect(compiled.querySelector('tbody')?.textContent).toContain('Customer Portal');
  });

  it('should show an error when the backend is unreachable', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    httpTesting.expectOne('/api/applications').error(new ProgressEvent('error'), { status: 0 });
    httpTesting.match('/api/items');
    await fixture.whenStable();

    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Cannot reach the server');
  });
});
