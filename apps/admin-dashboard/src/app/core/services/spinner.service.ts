import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SpinnerService {
  readonly isLoading = signal(false);
  private timeout: ReturnType<typeof setTimeout> | null = null;

  dispatch(isLoading: boolean | number) {
    if (isLoading) {
      // Cancel any pending hide delay
      if (this.timeout) clearTimeout(this.timeout);
      this.isLoading.set(true);
    } else {
      // Delay hiding spinner to avoid flicker
      this.timeout = setTimeout(() => {
        this.isLoading.set(false);
      }, 200); // ← 300ms is UX sweet spot
    }
  }
}
