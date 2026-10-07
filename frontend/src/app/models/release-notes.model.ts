export const STATUSES = ['DRAFT', 'REVIEW', 'PUBLISHED'] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  DRAFT: 'Draft',
  REVIEW: 'Review',
  PUBLISHED: 'Published',
};

export interface Application {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  applicationId: number;
  applicationName: string;
  title: string;
  description: string | null;
  version: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemRequest {
  applicationId: number;
  title: string;
  description?: string;
  version?: string;
}

export interface StatusChange {
  itemId: number;
  status: Status;
}
