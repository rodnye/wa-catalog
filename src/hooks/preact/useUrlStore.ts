import type { PreinitializedWritableAtomUrlParam } from '@/utils/url-params';
import { useEffect, useState } from 'preact/hooks';

export const useUrlStore = (atom: PreinitializedWritableAtomUrlParam) => {
  const [value, setValue] = useState(() => atom.get());

  useEffect(() => {
    const unsubscribe = atom.subscribe((value) => setValue(value));
    return unsubscribe;
  }, [atom]);

  return value;
};
