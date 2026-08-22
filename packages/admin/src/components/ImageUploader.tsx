import { logger } from '@catalog/shared/src/logger';
import { useRef, useState, useEffect, useCallback } from 'preact/hooks';

interface Props {
  images: string[];
  productId: string;
  onImagesChange: (
    currentImages: string[],
    newFiles: File[],
    removedImages: string[],
  ) => void;
}

interface LocalItem {
  id: string;
  source: string | File;
}

let uid = 0;
const nextId = () => `img-${++uid}`;

export default function ImageUploader({
  images,
  productId,
  onImagesChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [localItems, setLocalItems] = useState<LocalItem[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());

  const prevProductId = useRef<string | null>(null);

  useEffect(() => {
    if (prevProductId.current !== productId) {
      prevProductId.current = productId;
      const items: LocalItem[] = images.map((src) => ({
        id: nextId(),
        source: src,
      }));
      setLocalItems(items);
      setRemoved([]);
      setPreviews(new Map());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    const newPreviews = new Map(previews);
    let changed = false;

    for (const item of localItems) {
      if (item.source instanceof File && !newPreviews.has(item.id)) {
        newPreviews.set(item.id, URL.createObjectURL(item.source));
        changed = true;
      }
    }

    for (const key of newPreviews.keys()) {
      if (!localItems.some((i) => i.id === key)) {
        URL.revokeObjectURL(newPreviews.get(key)!);
        newPreviews.delete(key);
        changed = true;
      }
    }

    if (changed) setPreviews(newPreviews);
    setLoading(false);
  }, [localItems]);

  // useEffect(() => {
  //   return () => {
  //     previews.forEach((url) => URL.revokeObjectURL(url));
  //   };
  // }, []);

  const notifyParent = useCallback(
    (items: LocalItem[], rem: string[]) => {
      const files = items
        .filter(
          (i): i is LocalItem & { source: File } => i.source instanceof File,
        )
        .map((i) => i.source as File);
      const kept = items
        .filter((i) => typeof i.source === 'string')
        .map((i) => i.source as string);
      onImagesChange(kept, files, rem);
    },
    [onImagesChange],
  );

  /* ── Handlers ── */
  const handleAdd = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) return;

    const newItems: LocalItem[] = files.map((f) => ({
      id: nextId(),
      source: f,
    }));

    const next = [...localItems, ...newItems];
    setLocalItems(next);
    notifyParent(next, removed);
    // input.value = '';
  };

  const handleRemove = (id: string) => {
    const item = localItems.find((i) => i.id === id);
    if (!item) return;

    const newRemoved = [...removed];
    if (typeof item.source === 'string') {
      newRemoved.push(item.source);
    }

    const url = previews.get(id);
    if (url) URL.revokeObjectURL(url);

    const next = localItems.filter((i) => i.id !== id);
    setLocalItems(next);
    setRemoved(newRemoved);
    notifyParent(next, newRemoved);
  };

  const getSrc = (item: LocalItem): string => {
    logger.info(item);
    if (typeof item.source === 'string') return item.source;
    return previews.get(item.id) || '';
  };

  if (loading) return <div>Cargando...</div>;

  logger.trace(localItems, 'ImageUploader.localItems');
  return (
    <div>
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {localItems.map((item) => (
          <div
            key={item.id}
            class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group"
          >
            {getSrc(item) && (
              <img
                src={getSrc(item)}
                alt="Imagen del producto"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            )}
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              class="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-sm opacity-80 hover:opacity-100 active:scale-90 transition-all"
              aria-label="Eliminar imagen"
            >
              ✕
            </button>
          </div>
        ))}

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
    </div>
  );
}
