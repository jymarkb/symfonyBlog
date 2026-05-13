const KEY = 'auth_return_to';

export function setAuthReturnTo(path: string): void {
  try { sessionStorage.setItem(KEY, path); } catch {}
}

export function getAndClearAuthReturnTo(): string | null {
  try {
    const path = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return path;
  } catch { return null; }
}
