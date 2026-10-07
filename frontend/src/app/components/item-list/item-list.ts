import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import { Item, Status, STATUS_LABELS, StatusChange, STATUSES } from '../../models/release-notes.model';

@Component({
  selector: 'app-item-list',
  imports: [DatePipe, MatFormFieldModule, MatSelectModule],
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

  protected onStatusSelected(item: Item, event: MatSelectChange<Status>): void {
    // Keep showing the persisted status until the server confirms the change.
    event.source.value = item.status;
    if (event.value !== item.status) {
      this.statusChange.emit({ itemId: item.id, status: event.value });
    }
  }
}
