import { useState } from 'preact/hooks';
import SearchBar from './SearchBar';

export default function MobileSearchToggle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        class="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Buscar"
      >
        <svg
          class="w-5 h-5"
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
      </button>
      <div
        class={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-16' : 'max-h-0'
        }`}
      >
        <div class="pb-3">
          <SearchBar />
        </div>
      </div>
    </>
  );
}
