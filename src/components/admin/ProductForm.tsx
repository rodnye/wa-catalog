import { useState, useEffect } from 'preact/hooks';
import { createProduct, updateProduct } from '@/stores/productStore';
import { getCategories } from '@/lib/categories';
import type { IProduct } from '@/types';

interface Props {
  product?: IProduct | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: Props) {
  const categories = getCategories();
  const [formData, setFormData] = useState<Partial<IProduct>>({
    name: '',
    description: '',
    price: 0,
    images: [],
    categories: [],
    featured: false,
    vip: false,
    available: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        images: [],
        categories: [],
        featured: false,
        vip: false,
        available: true,
      });
    }
  }, [product]);

  const handleChange = (field: keyof IProduct, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Validar campos requeridos
      if (
        !formData.name ||
        !formData.description ||
        formData.price === undefined ||
        !formData.categories?.length
      ) {
        throw new Error(
          'Nombre, descripción, precio y al menos una categoría son obligatorios',
        );
      }
      // Generar id a partir del nombre si es nuevo
      const id =
        product?.id || formData.name!.toLowerCase().replace(/\s+/g, '-');
      const payload: IProduct = {
        id,
        name: formData.name!,
        description: formData.description!,
        price: Number(formData.price),
        currency: 'CUP',
        images: formData.images || [],
        categories: formData.categories!,
        featured: !!formData.featured,
        vip: !!formData.vip,
        available: formData.available !== false,
      };
      if (product) {
        await updateProduct(payload);
      } else {
        await createProduct(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      {error && (
        <div class="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onInput={(e) =>
              handleChange('name', (e.target as HTMLInputElement).value)
            }
            class="input-field"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Precio (CUP) *
          </label>
          <input
            type="number"
            value={formData.price || 0}
            onInput={(e) =>
              handleChange(
                'price',
                parseFloat((e.target as HTMLInputElement).value) || 0,
              )
            }
            class="input-field"
            min="0"
            step="100"
            required
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            value={formData.description || ''}
            onInput={(e) =>
              handleChange(
                'description',
                (e.target as HTMLTextAreaElement).value,
              )
            }
            class="input-field"
            rows={2}
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Imágenes (URLs separadas por coma)
          </label>
          <input
            type="text"
            value={(formData.images || []).join(', ')}
            onInput={(e) =>
              handleChange(
                'images',
                (e.target as HTMLInputElement).value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            class="input-field"
            placeholder="https://ejemplo.com/img1.jpg, https://..."
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Categorías *
          </label>
          <select
            multiple
            onChange={(e) => {
              const options = (e.target as HTMLSelectElement).options;
              const selected: string[] = [];
              for (let i = 0; i < options.length; i++) {
                if (options[i].selected) selected.push(options[i].value);
              }
              handleChange('categories', selected);
            }}
            class="input-field"
            required
          >
            {categories.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ))}
          </select>
          <p class="text-xs text-gray-400 mt-1">
            Mantén presionado Ctrl/Cmd para seleccionar múltiples
          </p>
        </div>
        <div class="flex items-center space-x-6">
          <label class="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!formData.featured}
              onChange={(e) =>
                handleChange('featured', (e.target as HTMLInputElement).checked)
              }
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>Destacado</span>
          </label>
          <label class="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!formData.vip}
              onChange={(e) =>
                handleChange('vip', (e.target as HTMLInputElement).checked)
              }
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>VIP</span>
          </label>
          <label class="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.available !== false}
              onChange={(e) =>
                handleChange(
                  'available',
                  (e.target as HTMLInputElement).checked,
                )
              }
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>Disponible</span>
          </label>
        </div>
      </div>
      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onClose} class="btn-outline">
          Cancelar
        </button>
        <button type="submit" disabled={saving} class="btn-primary">
          {saving ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
