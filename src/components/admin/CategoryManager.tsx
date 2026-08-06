import { useState, useEffect } from 'preact/hooks';
import {
  loadCategoriesFromRepo,
  saveCategoriesToRepo,
  type ICategory,
} from '@/stores/productStore';

const EMOJI_POOL = [
  '💎',
  '🎨',
  '🎧',
  '✨',
  '🌿',
  '🏠',
  '🌱',
  '💍',
  '💄',
  '👗',
  '🏕️',
  '👕',
  '📱',
  '🎮',
  '📚',
  '🧴',
  '🍳',
  '🎁',
  '🧸',
  '🔧',
  '💡',
  '🎵',
  '🏋️',
  '🧹',
  '🪴',
  '🛋️',
  '📷',
  '🎒',
  '👟',
  '🧢',
  '🕶️',
  '💻',
  '⌚',
  '🔌',
  '🪞',
  '🧵',
  '🎀',
  '🧺',
  '🛍️',
  '🧶',
  '🪑',
  '🚗',
  '🐾',
  '🍽️',
  '☕',
  '🧊',
  '🩴',
  '👒',
  '🧣',
  '🩱',
];

export default function CategoryManager() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [showEmojiFor, setShowEmojiFor] = useState<number | null>(null);

  /* new-category form */
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('🌿');
  const [showNewEmoji, setShowNewEmoji] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const cats = await loadCategoriesFromRepo();
      setCategories(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await saveCategoriesToRepo(categories);
      setSuccess('✅ Categorías guardadas correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (idx: number, field: keyof ICategory, value: string) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    );
  };

  const handleDelete = (idx: number) => {
    if (!window.confirm(`¿Eliminar la categoría "${categories[idx].label}"?`))
      return;
    setCategories((prev) => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    const key = label;
    if (categories.some((c) => c.key === key)) {
      setError('Ya existe una categoría con ese nombre');
      return;
    }
    setCategories((prev) => [...prev, { label, key, emoji: newEmoji }]);
    setNewLabel('');
    setNewEmoji('🌿');
    setError('');
  };

  if (loading) {
    return (
      <div class="text-center py-12 text-gray-400">Cargando categorías…</div>
    );
  }

  return (
    <div class="space-y-6">
      {/* messages */}
      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div class="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {/* add new */}
      <div class="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
        <h3 class="font-semibold text-gray-800 mb-3">➕ Nueva categoría</h3>
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newLabel}
            onInput={(e) => setNewLabel((e.target as HTMLInputElement).value)}
            placeholder="Nombre de la categoría"
            class="input-field flex-1"
          />
          <div class="flex gap-2">
            <button
              type="button"
              onClick={() => setShowNewEmoji(!showNewEmoji)}
              class="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-2xl hover:bg-gray-50 active:scale-95 transition-all"
            >
              {newEmoji}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              class="btn-primary whitespace-nowrap"
            >
              Agregar
            </button>
          </div>
        </div>

        {showNewEmoji && (
          <div class="mt-3 grid grid-cols-8 sm:grid-cols-10 gap-1 p-3 bg-gray-50 rounded-xl max-h-36 overflow-y-auto">
            {EMOJI_POOL.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setNewEmoji(e);
                  setShowNewEmoji(false);
                }}
                class={`text-xl p-1 rounded-lg hover:bg-primary-100 active:scale-90 transition-all ${
                  newEmoji === e ? 'bg-primary-100 ring-2 ring-primary-400' : ''
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* list */}
      <div class="space-y-2">
        {categories.map((cat, idx) => (
          <div
            key={cat.key}
            class="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {editingIdx === idx ? (
              /* ── edit mode ── */
              <div class="p-4 space-y-3">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setShowEmojiFor(showEmojiFor === idx ? null : idx)
                    }
                    class="w-12 h-12 shrink-0 rounded-xl border border-gray-200 flex items-center justify-center text-2xl hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    {cat.emoji}
                  </button>
                  <div class="flex-1 space-y-2">
                    <input
                      type="text"
                      value={cat.label}
                      onInput={(e) =>
                        updateField(
                          idx,
                          'label',
                          (e.target as HTMLInputElement).value,
                        )
                      }
                      class="input-field"
                      placeholder="Nombre"
                    />
                    <input
                      type="text"
                      value={cat.key}
                      onInput={(e) =>
                        updateField(
                          idx,
                          'key',
                          (e.target as HTMLInputElement).value,
                        )
                      }
                      class="input-field text-xs text-gray-500"
                      placeholder="Clave (key)"
                    />
                  </div>
                </div>

                {showEmojiFor === idx && (
                  <div class="grid grid-cols-8 sm:grid-cols-10 gap-1 p-3 bg-gray-50 rounded-xl max-h-36 overflow-y-auto">
                    {EMOJI_POOL.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => {
                          updateField(idx, 'emoji', e);
                          setShowEmojiFor(null);
                        }}
                        class={`text-xl p-1 rounded-lg hover:bg-primary-100 active:scale-90 transition-all ${
                          cat.emoji === e
                            ? 'bg-primary-100 ring-2 ring-primary-400'
                            : ''
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}

                <div class="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingIdx(null)}
                    class="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingIdx(null)}
                    class="text-sm bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 active:scale-95 transition-all"
                  >
                    Listo
                  </button>
                </div>
              </div>
            ) : (
              /* ── view mode ── */
              <div class="flex items-center gap-3 px-4 py-3">
                <span class="text-2xl">{cat.emoji}</span>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-800 truncate">{cat.label}</p>
                  <p class="text-xs text-gray-400 truncate">key: {cat.key}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingIdx(idx)}
                  class="p-2 rounded-lg text-blue-500 hover:bg-blue-50 active:scale-90 transition-all"
                  aria-label="Editar"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  class="p-2 rounded-lg text-red-400 hover:bg-red-50 active:scale-90 transition-all"
                  aria-label="Eliminar"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* save button */}
      <button
        onClick={handleSaveAll}
        disabled={saving}
        class="w-full btn-primary py-3.5 text-base disabled:opacity-50"
      >
        {saving ? 'Guardando…' : '💾 Guardar categorías'}
      </button>
    </div>
  );
}
