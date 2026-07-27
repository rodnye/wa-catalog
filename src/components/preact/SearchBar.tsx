import { useRef } from 'preact/hooks';
import { searchQuery } from '@/stores/searchStore';
import IconSearch from '~icons/mdi/search';

interface Props {
  placeholder?: string;
}

export default function SearchBar({
  placeholder = 'Buscar productos...',
}: Props) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      searchQuery.set(value);
    }, 250);
  };

  return (
    <div class="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        class="input-field pl-10 pr-4"
        onInput={handleInput}
      />
      <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
    </div>
  );
}
