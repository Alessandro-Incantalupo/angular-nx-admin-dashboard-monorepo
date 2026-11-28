// Runs before each test file; Angular's unit-test builder has already set up TestBed (zoneless).
import { getTestBed } from '@angular/core/testing';

getTestBed().configureTestingModule({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

// `window.matchMedia` is missing in jsdom (ngx-sonner needs it).
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
