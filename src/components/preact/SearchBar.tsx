import { useRef } from 'preact/hooks';
import { searchQuery } from '@/stores/searchStore';

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
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}
