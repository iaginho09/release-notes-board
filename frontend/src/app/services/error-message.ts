import { HttpErrorResponse } from '@angular/common/http';

interface ProblemDetail {
  detail?: string;
  errors?: Record<string, string>;
}

/** Turns an HTTP error (RFC 7807 problem detail from the backend) into a user-facing message. */
export function toErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'An unexpected error occurred.';
  }
  if (error.status === 0) {
    return 'Cannot reach the server. Please check that the backend is running.';
  }

  const problem = error.error as ProblemDetail | null;
  if (problem?.errors && Object.keys(problem.errors).length > 0) {
    const fieldErrors = Object.entries(problem.errors)
      .map(([field, message]) => `${field} ${message}`)
      .join(', ');
    return `${problem.detail ?? 'Validation failed'}: ${fieldErrors}.`;
  }
  return problem?.detail ?? `Request failed with status ${error.status}.`;
}
