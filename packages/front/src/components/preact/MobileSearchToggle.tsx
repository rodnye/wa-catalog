import { useEffect, useState } from 'preact/hooks';
import SearchBar from './SearchBar';
import IconSearch from '~icons/mdi/search';
import IconClose from '~icons/mdi/close';
import { useUrlStore } from '@/hooks/preact/useUrlStore';
import { searchQuery } from '@/stores/searchStore';

export default function MobileSearchToggle() {
  const query = useUrlStore(searchQuery);
  const [isOpen, setIsOpen] = useState(!!query);

  useEffect(() => {
    if (!isOpen) searchQuery.forceSet(null);
  }, [isOpen]);

  return (
    <div class="flex items-center">
      <div
        class={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-w-md' : 'max-w-0'
        }`}
      >
        <SearchBar />
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        class="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Buscar"
      >
        {isOpen ? <IconClose class="size-5" /> : <IconSearch class="size-5" />}
      </button>
    </div>
  );
}
