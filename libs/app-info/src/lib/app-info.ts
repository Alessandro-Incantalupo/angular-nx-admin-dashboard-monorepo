export const APP_INFO = {
  name: 'admin-dashboard',
  version: '0.20.1',
  license: 'MIT',
  author: 'Alessandro Incantalupo',
};

export function getNextResetMs(intervalMs = 1000 * 60 * 60) {
  const now = Date.now();
  const next = Math.ceil(now / intervalMs) * intervalMs;
  return next - now;
}
