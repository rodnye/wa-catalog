import { useRef, useState, useEffect } from 'preact/hooks';

interface Props {
  images: string[];
  productId: string;
  onImagesChange: (
    currentImages: string[],
    newFiles: File[],
    removedImages: string[],
  ) => void;
}

export default function ImageUploader({
  images,
  productId,
  onImagesChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localItems, setLocalItems] = useState<(string | File)[]>([...images]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [previews, setPreviews] = useState<Map<number, string>>(new Map());

  /* sync when parent resets (e.g. switching product) */
  useEffect(() => {
    setLocalItems([...images]);
    setRemoved([]);
    setPreviews(new Map());
  }, [images, productId]);

  const notifyParent = (items: (string | File)[], rem: string[]) => {
    const files = items.filter((i): i is File => i instanceof File);
    const kept = items.filter((i): i is string => typeof i === 'string');
    onImagesChange(kept, files, rem);
  };

  const handleAdd = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) return;
    const next = [...localItems, ...files];
    setLocalItems(next);
    notifyParent(next, removed);
    input.value = '';
  };

  const handleRemove = (index: number) => {
    const item = localItems[index];
    const newRemoved = [...removed];
    if (typeof item === 'string') newRemoved.push(item);

    const next = localItems.filter((_, i) => i !== index);
    setLocalItems(next);
    setRemoved(newRemoved);
    notifyParent(next, newRemoved);
  };

  const getSrc = (item: string | File, idx: number): string => {
    if (typeof item === 'string') return item;
    if (!previews.has(idx)) {
      previews.set(idx, URL.createObjectURL(item));
    }
    return previews.get(idx)!;
  };

  return (
    <div>
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {localItems.map((item, i) => (
          <div
            key={typeof item === 'string' ? item : `file-${i}`}
            class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group"
          >
            <img
              src={getSrc(item, i)}
              alt={`Imagen ${i + 1}`}
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              class="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-sm opacity-80 hover:opacity-100 active:scale-90 transition-all"
              aria-label="Eliminar imagen"
            >
              ✕
            </button>
          </div>
        ))}

        {/* add button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          class="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50/50 active:scale-95 transition-all"
        >
          <svg
            class="w-7 h-7 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span class="text-[11px] font-medium">Agregar</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleAdd}
        class="hidden"
      />

      <p class="text-xs text-gray-400 mt-2">
        Toca «Agregar» para subir fotos. Las imágenes eliminadas se borrarán del
        repositorio al guardar.
      </p>
    </div>
  );
}
