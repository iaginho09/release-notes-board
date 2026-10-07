import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Item, Status, STATUS_LABELS, StatusChange, STATUSES } from '../../models/release-notes.model';

@Component({
  selector: 'app-item-list',
  imports: [DatePipe],
  templateUrl: './item-list.html',
  styleUrl: './item-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemList {
  readonly items = input.required<Item[]>();
  readonly updatingIds = input<ReadonlySet<number>>(new Set());
  readonly statusChange = output<StatusChange>();

  protected readonly statuses = STATUSES;
  protected readonly statusLabels = STATUS_LABELS;

  protected onStatusSelected(item: Item, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as Status;
    // Keep showing the persisted status until the server confirms the change.
    select.value = item.status;
    if (status !== item.status) {
      this.statusChange.emit({ itemId: item.id, status });
    }
  }
}
