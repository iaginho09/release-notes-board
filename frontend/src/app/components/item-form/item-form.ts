import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Application, CreateItemRequest } from '../../models/release-notes.model';

const NOT_BLANK = /\S/;

@Component({
  selector: 'app-item-form',
  imports: [ReactiveFormsModule],
  templateUrl: './item-form.html',
  styleUrl: './item-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemForm {
  readonly applications = input.required<Application[]>();
  readonly submitting = input(false);
  readonly created = output<CreateItemRequest>();

  private readonly fb = inject(FormBuilder);

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
    this.form.reset();
  }

  protected hasError(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }
}
