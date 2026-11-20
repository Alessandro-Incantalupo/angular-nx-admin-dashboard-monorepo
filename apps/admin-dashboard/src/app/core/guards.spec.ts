import { safeNext } from './guards';

describe('safeNext', () => {
  it('keeps a path inside the app', () => {
    expect(safeNext('/members')).toBe('/members');
    expect(safeNext('/settings?tab=1')).toBe('/settings?tab=1');
  });

  it('refuses other sites and odd values', () => {
    for (const next of [
      'https://evil.example',
      '//evil.example',
      '/\\evil.example',
      'members',
      '',
      null,
      undefined,
    ]) {
      expect(safeNext(next)).toBe('/dashboard');
    }
  });

  it('never sends you back to the login page', () => {
    expect(safeNext('/login?next=/members')).toBe('/dashboard');
  });
});
