import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { injectBaseUrl } from '@core/CIF/inject-base-url';

/**
 * SimulationService provides a way to test professional error handling (RFC 7807)
 * directly from the code or browser console.
 *
 * INTELLIGENT PATTERN: Developer Tools
 * This service centralizes all "failing" endpoints so developers can verify
 * toast notifications and global interceptors.
 */
@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private http = inject(HttpClient);
  private createUrl = injectBaseUrl();

  // Unified simulation path following the project's absolute URL pattern
  private simulateUrl = this.createUrl('/simulate', () => '/simulate');

  /**
   * Triggers a 400 Bad Request with field-level validation errors.
   */
  testValidationError() {
    this.http.get(`${this.simulateUrl}/validation-error`).subscribe({
      error: err =>
        console.log('Validation error handled by subscription:', err),
    });
  }

  /**
   * Triggers a BadRequestAlertException (Business Logic Failure).
   */
  testBadRequest() {
    this.http.get(`${this.simulateUrl}/bad-request`).subscribe({
      error: err => console.log('Bad request handled by subscription:', err),
    });
  }

  /**
   * Triggers a 500 Internal Server Error.
   */
  testServerError() {
    this.http.get(`${this.simulateUrl}/server-error`).subscribe({
      error: err => console.log('Server error handled by subscription:', err),
    });
  }

  /**
   * Triggers a wrapped success response.
   */
  testEnvelopeUnwrapping() {
    this.http.get(`${this.simulateUrl}/envelope`).subscribe({
      next: data => console.log('Unwrapped Data received by subscriber:', data),
      error: err => console.log('Envelope test failed:', err),
    });
  }
}
