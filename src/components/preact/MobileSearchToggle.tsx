import { useState } from 'preact/hooks';
import SearchBar from './SearchBar';
import IconSearch from '~icons/mdi/search';

export default function MobileSearchToggle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        class="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Buscar"
      >
        <IconSearch class="size-5" />
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
