import { HttpErrorResponse } from '@angular/common/http';

import { toErrorMessage } from './error-message';

describe('toErrorMessage', () => {
  it('should list field errors from a validation problem detail', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { detail: 'Validation failed', errors: { title: 'must not be blank' } },
    });

    expect(toErrorMessage(error)).toBe('Validation failed: title must not be blank.');
  });

  it('should use the problem detail message', () => {
    const error = new HttpErrorResponse({ status: 404, error: { detail: 'Item 9 not found' } });

    expect(toErrorMessage(error)).toBe('Item 9 not found');
  });

  it('should report an unreachable server', () => {
    expect(toErrorMessage(new HttpErrorResponse({ status: 0 }))).toContain('Cannot reach the server');
  });

  it('should fall back to a generic message for non-HTTP errors', () => {
    expect(toErrorMessage(new Error('boom'))).toBe('An unexpected error occurred.');
  });
});
