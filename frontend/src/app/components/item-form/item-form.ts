import { ChangeDetectionStrategy, Component, inject, input, output, viewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Application, CreateItemRequest } from '../../models/release-notes.model';

const NOT_BLANK = /\S/;

@Component({
  selector: 'app-item-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './item-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemForm {
  readonly applications = input.required<Application[]>();
  readonly submitting = input(false);
  readonly created = output<CreateItemRequest>();

  private readonly fb = inject(FormBuilder);
  private readonly formDirective = viewChild.required(FormGroupDirective);

  protected readonly form = this.fb.group({
    applicationId: this.fb.control<number | null>(null, Validators.required),
    title: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(NOT_BLANK), Validators.maxLength(200)]),
    version: this.fb.nonNullable.control('', Validators.maxLength(50)),
    description: this.fb.nonNullable.control('', Validators.maxLength(5000)),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { applicationId, title, version, description } = this.form.getRawValue();
    this.created.emit({
      applicationId: applicationId as number,
      title: title.trim(),
      version: version.trim() || undefined,
      description: description.trim() || undefined,
    });
  }

  /** Called by the parent once the item has been saved. */
  reset(): void {
    // Resetting through the directive also clears the "submitted" state, so no errors show on the empty form.
    this.formDirective().resetForm();
  }
}
