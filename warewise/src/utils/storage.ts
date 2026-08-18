export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function safeStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    return safeJsonParse<T>(window.localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

export function safeStorageSet<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota or browser privacy errors.
  }
}
