import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectHarness } from '@angular/material/select/testing';

import { CreateItemRequest } from '../../models/release-notes.model';
import { ItemForm } from './item-form';

describe('ItemForm', () => {
  let fixture: ComponentFixture<ItemForm>;
  let loader: HarnessLoader;
  let emitted: CreateItemRequest[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ItemForm] }).compileComponents();
    fixture = TestBed.createComponent(ItemForm);
    fixture.componentRef.setInput('applications', [{ id: 1, name: 'Customer Portal' }]);
    emitted = [];
    fixture.componentInstance.created.subscribe((request) => emitted.push(request));
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  async function selectApplication(name: string): Promise<void> {
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    await select.clickOptions({ text: name });
  }

  async function setTitle(value: string): Promise<void> {
    const title = await loader.getHarness(MatInputHarness.with({ selector: '[formControlName="title"]' }));
    await title.setValue(value);
  }

  async function submit(): Promise<void> {
    const button = await loader.getHarness(MatButtonHarness.with({ text: 'Create entry' }));
    await button.click();
  }

  it('should not emit and should show errors when required fields are missing', async () => {
    await submit();

    expect(emitted).toEqual([]);
    const errors = await Promise.all(
      (await loader.getAllHarnesses(MatFormFieldHarness)).map((field) => field.getTextErrors()),
    );
    expect(errors.flat()).toEqual(['Please select an application.', 'Title is required (max. 200 characters).']);
  });

  it('should reject a whitespace-only title', async () => {
    await selectApplication('Customer Portal');
    await setTitle('   ');
    await submit();

    expect(emitted).toEqual([]);
  });

  it('should emit a trimmed request without empty optional fields', async () => {
    await selectApplication('Customer Portal');
    await setTitle('  New login page  ');
    await submit();

    expect(emitted).toEqual([{ applicationId: 1, title: 'New login page', version: undefined, description: undefined }]);
  });
});
