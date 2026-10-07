import { ChangeDetectionStrategy, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { ItemForm } from './components/item-form/item-form';
import { ItemList } from './components/item-list/item-list';
import { Application, CreateItemRequest, Item, StatusChange } from './models/release-notes.model';
import { toErrorMessage } from './services/error-message';
import { ReleaseNotesApi } from './services/release-notes-api';

@Component({
  selector: 'app-root',
  imports: [ItemForm, ItemList],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly api = inject(ReleaseNotesApi);
  private readonly itemForm = viewChild(ItemForm);

  protected readonly applications = signal<Application[]>([]);
  protected readonly items = signal<Item[]>([]);
  protected readonly loading = signal(true);
  protected readonly creating = signal(false);
  protected readonly updatingIds = signal<ReadonlySet<number>>(new Set());
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    forkJoin({ applications: this.api.getApplications(), items: this.api.getItems() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ applications, items }) => {
          this.applications.set(applications);
          this.items.set(items);
        },
        error: (error: unknown) => this.errorMessage.set(toErrorMessage(error)),
      });
  }

  protected createItem(request: CreateItemRequest): void {
    this.creating.set(true);
    this.errorMessage.set(null);
    this.api.createItem(request)
      .pipe(finalize(() => this.creating.set(false)))
      .subscribe({
        next: (item) => {
          this.items.update((items) => [item, ...items]);
          this.itemForm()?.reset();
        },
        error: (error: unknown) => this.errorMessage.set(toErrorMessage(error)),
      });
  }

  protected changeStatus({ itemId, status }: StatusChange): void {
    this.setUpdating(itemId, true);
    this.errorMessage.set(null);
    this.api.changeStatus(itemId, status)
      .pipe(finalize(() => this.setUpdating(itemId, false)))
      .subscribe({
        next: (updated) => this.items.update((items) => items.map((item) => (item.id === updated.id ? updated : item))),
        error: (error: unknown) => this.errorMessage.set(toErrorMessage(error)),
      });
  }

  protected dismissError(): void {
    this.errorMessage.set(null);
  }

  private setUpdating(itemId: number, updating: boolean): void {
    this.updatingIds.update((ids) => {
      const next = new Set(ids);
      if (updating) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  }
}
