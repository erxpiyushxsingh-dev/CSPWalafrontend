// Centralised "session expired" handler. Clears all auth state and sends the
// user to the public landing page with a flag so a "session expired" popup can
// be shown there. Guarded so concurrent 401s don't redirect multiple times.
let fired = false;

export function triggerSessionExpired() {
  if (typeof window === 'undefined' || fired) return;
  fired = true;
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
  // Clear the cookie the middleware gates /dashboard on.
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  window.location.href = '/user?session=expired';
}
