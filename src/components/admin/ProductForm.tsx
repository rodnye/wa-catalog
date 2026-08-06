import { useState, useEffect, useCallback } from 'preact/hooks';
import { saveProductWithImages, savingStore } from '@/stores/productStore';
import { getCategories } from '@/lib/categories';
import type { IProduct } from '@/types';
import ImageUploader from './ImageUploader';
import { useStore } from '@nanostores/preact';
import IconClose from '~icons/mdi/close';
import IconSparkles from '~icons/mdi/sparkles';
import IconPencil from '~icons/mdi/pencil';
import IconStar from '~icons/mdi/star';
import IconCrown from '~icons/mdi/crown';
import IconLoading from '~icons/mdi/loading';

interface Props {
  product: IProduct | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: Props) {
  const categories = getCategories();
  const saving = useStore(savingStore);
  const isNew = !product;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState<'CUP' | 'USD'>('CUP');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [vip, setVip] = useState(false);
  const [available, setAvailable] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setCurrency(product.currency || 'CUP');
      setSelectedCats([...product.categories]);
      setFeatured(!!product.featured);
      setVip(!!product.vip);
      setAvailable(product.available !== false);
      setImages([...product.images]);
    } else {
      setName('');
      setDescription('');
      setPrice(0);
      setCurrency('CUP');
      setSelectedCats([]);
      setFeatured(false);
      setVip(false);
      setAvailable(true);
      setImages([]);
    }
    setNewFiles([]);
    setRemovedImages([]);
    setError('');
  }, [product]);

  const handleImagesChange = useCallback(
    (kept: string[], files: File[], removed: string[]) => {
      setImages(kept);
      setNewFiles(files);
      setRemovedImages(removed);
    },
    [],
  );

  const toggleCat = (key: string) => {
    setSelectedCats((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  };

  const handleSave = async () => {
    setError('');

    if (!name.trim()) return setError('El nombre es obligatorio');
    if (!description.trim()) return setError('La descripción es obligatoria');
    if (price <= 0) return setError('El precio debe ser mayor a 0');
    if (selectedCats.length === 0)
      return setError('Selecciona al menos una categoría');

    const id =
      product?.id ||
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const payload: IProduct = {
      id,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      currency,
      images,
      categories: selectedCats,
      featured,
      vip,
      available,
    };

    try {
      await saveProductWithImages({
        product: payload,
        isNew,
        newFiles,
        removedImages,
      });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    }
  };

  return (
    <div class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      {/* overlay */}
      <div class="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* panel */}
      <div class="relative w-full sm:max-w-2xl bg-white sm:rounded-2xl rounded-t-2xl max-h-[92dvh] flex flex-col shadow-2xl">
        {/* header */}
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 class="font-bold text-lg text-gray-800 flex items-center gap-2">
            {isNew ? (
              <>
                <IconSparkles class="size-5 text-primary-500" />
                Nuevo producto
              </>
            ) : (
              <>
                <IconPencil class="size-5 text-primary-500" />
                Editar producto
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-90 transition-all"
            aria-label="Cerrar"
          >
            <IconClose class="size-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {error && (
            <div class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* name */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre del producto *
            </label>
            <input
              type="text"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              class="input-field"
              placeholder="Ej: Aretes de plata"
            />
          </div>

          {/* description */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción *
            </label>
            <textarea
              value={description}
              onInput={(e) =>
                setDescription((e.target as HTMLTextAreaElement).value)
              }
              class="input-field"
              rows={3}
              placeholder="Describe el producto…"
            />
          </div>

          {/* price + currency */}
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Precio *
              </label>
              <input
                type="number"
                value={price || ''}
                onInput={(e) =>
                  setPrice(
                    parseFloat((e.target as HTMLInputElement).value) || 0,
                  )
                }
                class="input-field"
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
            <div class="w-28">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) =>
                  setCurrency(
                    (e.target as HTMLSelectElement).value as 'CUP' | 'USD',
                  )
                }
                class="input-field"
              >
                <option value="CUP">CUP</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* categories */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Categorías *{' '}
              <span class="text-gray-400 font-normal">
                (toca para seleccionar)
              </span>
            </label>
            <div class="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = selectedCats.includes(cat.key);
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => toggleCat(cat.key)}
                    class={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-all active:scale-95 ${
                      active
                        ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    {active && <span class="ml-0.5">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* images */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Imágenes del producto
            </label>
            <ImageUploader
              images={product?.images ?? []}
              productId={product?.id || 'nuevo'}
              onImagesChange={handleImagesChange}
            />
          </div>

          {/* toggles */}
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label class="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 cursor-pointer active:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) =>
                  setAvailable((e.target as HTMLInputElement).checked)
                }
                class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm font-medium text-gray-700">Disponible</span>
            </label>
            <label class="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 cursor-pointer active:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) =>
                  setFeatured((e.target as HTMLInputElement).checked)
                }
                class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm font-medium text-gray-700 flex items-center gap-1">
                <IconStar class="size-4 text-yellow-400" />
                Destacado
              </span>
            </label>
            <label class="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 cursor-pointer active:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={vip}
                onChange={(e) => setVip((e.target as HTMLInputElement).checked)}
                class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm font-medium text-gray-700 flex items-center gap-1">
                <IconCrown class="size-4 text-amber-500" />
                VIP
              </span>
            </label>
          </div>
        </div>

        {/* footer */}
        <div class="flex gap-3 px-5 py-4 border-t border-gray-100 shrink-0 bg-white sm:rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 active:scale-[.98] transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            class="flex-1 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span class="flex items-center justify-center gap-2">
                <IconLoading class="animate-spin size-5" />
                Guardando...
              </span>
            ) : isNew ? (
              'Crear producto'
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
