import { useEffect, useState, useMemo, useRef } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import {
  productsStore,
  loadingStore,
  errorStore,
  loadingProgress,
  loadProducts,
  deleteProduct,
} from '@/stores/productStore';
import { logout, restoreSession } from '@/lib/auth';
import { userStore } from '@/stores/authStore';
import { navigate } from 'astro:transitions/client';
import { getCategories } from '@/lib/categories';
import { formatPrice, resolveUrlBase } from '@/utils/helpers';
import type { IProduct } from '@/types';
import ProductForm from './ProductForm';
import CategoryManager from './CategoryManager';
import IconCog from '~icons/mdi/cog';
import IconPackageVariant from '~icons/mdi/package-variant';
import IconTag from '~icons/mdi/tag';
import IconCamera from '~icons/mdi/camera';
import IconPencil from '~icons/mdi/pencil';
import IconTrashCanOutline from '~icons/mdi/trash-can-outline';
import IconEmailOpen from '~icons/mdi/email-open';
import IconCrown from '~icons/mdi/crown';
import IconStar from '~icons/mdi/star';
import IconMagnify from '~icons/mdi/magnify';
import IconChevronLeft from '~icons/mdi/chevron-left';
import IconChevronRight from '~icons/mdi/chevron-right';
import IconPlus from '~icons/mdi/plus';
import IconAlertCircle from '~icons/mdi/alert-circle';

const ITEMS_PER_PAGE = 20;

type Tab = 'products' | 'settings';
type StatusFilter = 'all' | 'available' | 'unavailable' | 'vip' | 'featured';

export default function DashboardContent() {
  const products = useStore(productsStore);
  const loading = useStore(loadingStore);
  const error = useStore(errorStore);
  const progress = useStore(loadingProgress);
  const user = useStore(userStore);

  const [tab, setTab] = useState<Tab>('products');
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const categories = getCategories();

  useEffect(() => {
    (async () => {
      await restoreSession();
      await loadProducts();
    })();
  }, []);

  /* ── auth guard ── */
  if (!user) {
    navigate(resolveUrlBase('/admin/v2/login'));
    return null;
  }

  /* ── filtering ── */
  const filtered = useMemo(() => {
    let list = products;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    if (activeCat) {
      list = list.filter((p) => p.categories.includes(activeCat));
    }

    switch (statusFilter) {
      case 'available':
        list = list.filter((p) => p.available);
        break;
      case 'unavailable':
        list = list.filter((p) => !p.available);
        break;
      case 'vip':
        list = list.filter((p) => p.vip);
        break;
      case 'featured':
        list = list.filter((p) => p.featured);
        break;
    }

    return list;
  }, [products, search, activeCat, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  /* ── handlers ── */

  const handleSearch = (e: Event) => {
    const v = (e.target as HTMLInputElement).value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(v);
      setPage(1);
    }, 250);
  };

  const handleCatFilter = (key: string) => {
    setActiveCat((prev) => (prev === key ? '' : key));
    setPage(1);
  };

  const handleEdit = (p: IProduct) => {
    setEditingProduct(p);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleDelete = async (p: IProduct) => {
    if (
      !window.confirm(
        `¿Eliminar "${p.name}"?\nEsta acción no se puede deshacer.`,
      )
    )
      return;

    setDeletingId(p.id);
    try {
      await deleteProduct(p.id);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate(resolveUrlBase('/admin/v2/login'));
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <div class="w-full max-w-xs">
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p class="text-sm text-gray-500 mt-2 text-center">
            Cargando productos… {progress}%
          </p>
        </div>
      </div>
    );
  }

  /* ── error ── */
  if (error) {
    return (
      <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div class="bg-white rounded-2xl border border-red-200 p-6 max-w-md w-full text-center">
          <IconAlertCircle class="size-12 text-red-400 mx-auto mb-3" />
          <p class="text-red-600 font-medium mb-4">{error}</p>
          <button onClick={loadProducts} class="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col">
      {/* ── header ── */}
      <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div class="max-w-5xl mx-auto px-4">
          <div class="flex items-center justify-between h-14">
            <h1 class="font-bold text-gray-800 text-base sm:text-lg flex items-center gap-2">
              <IconCog class="size-5 text-gray-600" />
              <span class="hidden sm:inline">Panel de Administración</span>
              <span class="sm:hidden">Admin</span>
            </h1>
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-400 hidden sm:block max-w-[140px] truncate">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                class="text-xs sm:text-sm text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 active:scale-95 transition-all"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── tabs ── */}
      <div class="bg-white border-b border-gray-200 sticky top-14 z-30">
        <div class="max-w-5xl mx-auto px-4">
          <div class="flex gap-1">
            {(
              [
                {
                  key: 'products',
                  label: 'Productos',
                  icon: IconPackageVariant,
                },
                { key: 'settings', label: 'Categorías', icon: IconTag },
              ] as { key: Tab; label: string; icon: any }[]
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                class={`flex-1 sm:flex-none py-3 px-4 text-sm font-medium border-b-2 transition-all active:scale-[.98] flex items-center justify-center gap-1.5 ${
                  tab === t.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <t.icon class="size-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── content ── */}
      <main class="flex-1 max-w-5xl mx-auto w-full px-4 py-4 pb-24">
        {tab === 'settings' ? (
          <CategoryManager />
        ) : (
          <>
            {/* search */}
            <div class="relative mb-3">
              <input
                type="search"
                placeholder="Buscar por nombre o descripción…"
                onInput={handleSearch}
                class="input-field pl-10"
              />
              <IconMagnify class="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            </div>

            {/* category chips */}
            <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-2 -mx-4 px-4">
              <button
                onClick={() => handleCatFilter('')}
                class={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  activeCat === ''
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCatFilter(cat.key)}
                  class={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                    activeCat === cat.key
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* status filter */}
            <div class="flex items-center gap-2 mb-4 overflow-x-auto hide-scrollbar">
              {(
                [
                  ['all', 'Todos'],
                  ['available', 'Disponibles'],
                  ['unavailable', 'Agotados'],
                  ['vip', 'VIP'],
                  ['featured', 'Destacados'],
                ] as [StatusFilter, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setStatusFilter(key);
                    setPage(1);
                  }}
                  class={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 flex items-center gap-1 ${
                    statusFilter === key
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {key === 'vip' && <IconCrown class="size-3.5" />}
                  {key === 'featured' && <IconStar class="size-3.5" />}
                  {label}
                </button>
              ))}
              <span class="ml-auto text-xs text-gray-400 shrink-0">
                {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* product grid */}
            {paginated.length > 0 ? (
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {paginated.map((p) => (
                  <div
                    key={p.id}
                    class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex"
                  >
                    {/* thumb */}
                    <div class="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-gray-100 relative">
                      {p.images.length > 0 ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          loading="lazy"
                          class="w-full h-full object-cover"
                        />
                      ) : (
                        <div class="w-full h-full flex items-center justify-center text-gray-300">
                          <IconCamera class="size-8" />
                        </div>
                      )}
                      {!p.available && (
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span class="bg-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Agotado
                          </span>
                        </div>
                      )}
                    </div>

                    {/* info */}
                    <div class="flex-1 p-3 flex flex-col min-w-0">
                      <h3 class="text-sm font-semibold text-gray-800 truncate">
                        {p.name}
                      </h3>
                      <p class="text-sm font-bold text-primary-600 mt-0.5">
                        {formatPrice(p.price, p.currency)}
                      </p>

                      <div class="flex flex-wrap gap-1 mt-1.5">
                        {p.categories.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            class="text-[10px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded-full"
                          >
                            {c}
                          </span>
                        ))}
                        {p.vip && (
                          <span class="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                            <IconCrown class="size-3" />
                            VIP
                          </span>
                        )}
                        {p.featured && (
                          <span class="text-[10px] bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                            <IconStar class="size-3" />
                          </span>
                        )}
                      </div>

                      {/* actions */}
                      <div class="flex gap-2 mt-auto pt-2">
                        <button
                          onClick={() => handleEdit(p)}
                          class="flex-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg py-2 hover:bg-blue-100 active:scale-95 transition-all flex items-center justify-center gap-1"
                        >
                          <IconPencil class="size-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                          class="flex-1 text-xs font-medium text-red-500 bg-red-50 rounded-lg py-2 hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {deletingId === p.id ? (
                            '…'
                          ) : (
                            <>
                              <IconTrashCanOutline class="size-3.5" />
                              Borrar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div class="text-center py-16">
                <IconEmailOpen class="size-14 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-400 font-medium">
                  No se encontraron productos
                </p>
              </div>
            )}

            {/* pagination */}
            {totalPages > 1 && (
              <div class="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-90 transition-all disabled:opacity-30"
                >
                  <IconChevronLeft class="size-5" />
                </button>
                <span class="text-sm text-gray-500 px-3 font-medium">
                  {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-90 transition-all disabled:opacity-30"
                >
                  <IconChevronRight class="size-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── FAB ── */}
      {tab === 'products' && !showForm && (
        <button
          onClick={handleCreate}
          class="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center hover:bg-primary-600 active:scale-90 transition-all z-40"
          aria-label="Nuevo producto"
        >
          <IconPlus class="size-7" />
        </button>
      )}

      {/* ── product form modal ── */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}
    </div>
  );
}
