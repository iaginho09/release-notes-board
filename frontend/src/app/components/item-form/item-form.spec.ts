import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateItemRequest } from '../../models/release-notes.model';
import { ItemForm } from './item-form';

describe('ItemForm', () => {
  let fixture: ComponentFixture<ItemForm>;
  let element: HTMLElement;
  let emitted: CreateItemRequest[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ItemForm] }).compileComponents();
    fixture = TestBed.createComponent(ItemForm);
    fixture.componentRef.setInput('applications', [{ id: 1, name: 'Customer Portal' }]);
    emitted = [];
    fixture.componentInstance.created.subscribe((request) => emitted.push(request));
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  function setValue(selector: string, value: string): void {
    const field = element.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event(field instanceof HTMLSelectElement ? 'change' : 'input'));
  }

  async function submit(): Promise<void> {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  it('should not emit and should show errors when required fields are missing', async () => {
    await submit();

    expect(emitted).toEqual([]);
    expect(element.textContent).toContain('Please select an application.');
    expect(element.textContent).toContain('Title is required');
  });

  it('should reject a whitespace-only title', async () => {
    setValue('#applicationId', element.querySelectorAll('option')[1].value);
    setValue('#title', '   ');
    await submit();

    expect(emitted).toEqual([]);
  });

  it('should emit a trimmed request without empty optional fields', async () => {
    setValue('#applicationId', element.querySelectorAll('option')[1].value);
    setValue('#title', '  New login page  ');
    await submit();

    expect(emitted).toEqual([{ applicationId: 1, title: 'New login page', version: undefined, description: undefined }]);
  });
});
