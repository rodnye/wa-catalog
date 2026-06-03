const urlParamsStore = new Map<string, string>();
let listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const syncStoreWithUrl = () => {
  const params = new URLSearchParams(window.location.search);
  urlParamsStore.clear();
  params.forEach((value, key) => {
    urlParamsStore.set(key, value);
  });
};

const syncUrlWithStore = ({ force }: { force?: boolean } = {}) => {
  const params = new URLSearchParams();
  urlParamsStore.forEach((value, key) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history[force ? 'replaceState' : 'pushState'](
    Object.fromEntries(urlParamsStore),
    '',
    newUrl,
  );
};

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    syncStoreWithUrl();
    notifyListeners();
  });
}

/**
 * Inspired by nanostores
 */
export interface PreinitializedWritableAtomUrlParam {
  get: () => string | null;
  set: (value: string | null) => void;
  forceSet: (value: string | null) => void;
  subscribe: (callback: (value: string | null) => void) => () => boolean;
}

export function atomUrlParam(
  key: string,
  defaultValue: string | null = null,
): PreinitializedWritableAtomUrlParam {
  if (typeof window !== 'undefined' && urlParamsStore.size === 0) {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, paramKey) => {
      let parsedValue = value;
      urlParamsStore.set(paramKey, parsedValue);
    });
  }

  if (!urlParamsStore.has(key)) {
    if (defaultValue) urlParamsStore.set(key, defaultValue);
    else urlParamsStore.delete(key);
  }

  return {
    get: () => urlParamsStore.get(key) || null,
    set: (newValue: string | null) => {
      const oldValue = urlParamsStore.get(key) || null;
      if (oldValue !== newValue) {
        if (newValue) urlParamsStore.set(key, newValue);
        else urlParamsStore.delete(key);

        syncUrlWithStore();
        notifyListeners();
      }
    },
    forceSet: (newValue: string | null) => {
      if (newValue) urlParamsStore.set(key, newValue);
      else urlParamsStore.delete(key);

      syncUrlWithStore({ force: true });
      notifyListeners();
    },
    subscribe: (callback: (value: string | null) => void) => {
      const listener = () => callback(urlParamsStore.get(key) || null);
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
