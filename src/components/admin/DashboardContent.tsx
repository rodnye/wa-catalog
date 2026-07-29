import { useEffect, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import {
  productsStore,
  loadingStore,
  errorStore,
  loadProducts,
  deleteProduct,
} from '@/stores/productStore';
import { getCurrentUser, logout } from '@/lib/auth';
import { userStore } from '@/stores/authStore';
import { navigate } from 'astro:transitions/client';
import ProductForm from './ProductForm';
import type { IProduct } from '@/types';
import { resolveUrlBase } from '@/utils/helpers';

export default function DashboardContent() {
  const products = useStore(productsStore);
  const loading = useStore(loadingStore);
  const error = useStore(errorStore);
  const user = useStore(userStore);

  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const handleLogout = async () => {
    await logout();
    userStore.set(null);
  };

  const handleEdit = (product: IProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProduct(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (!user) {
    navigate(resolveUrlBase('/admin/v2/login'));
    return null;
  }

  if (loading) {
    return (
      <div class="text-center py-12 text-gray-500">Cargando productos...</div>
    );
  }

  if (error) {
    return (
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Error: {error}
        <button
          onClick={loadProducts}
          class="ml-4 text-sm underline hover:no-underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold text-gray-800">Dashboard</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                class="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div>
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Productos</h2>
            <button onClick={handleCreate} class="btn-primary">
              + Nuevo producto
            </button>
          </div>

          {showForm && (
            <div class="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <ProductForm
                product={editingProduct}
                onClose={handleFormClose}
                onSuccess={handleFormClose}
              />
            </div>
          )}

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div class="aspect-square bg-gray-50">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      class="w-full h-full object-cover"
                    />
                  ) : (
                    <div class="w-full h-full flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div class="p-4">
                  <h3 class="font-semibold text-gray-800 truncate">
                    {product.name}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">{product.price} CUP</p>
                  <div class="flex flex-wrap gap-1 mt-2">
                    {product.categories.map((cat) => (
                      <span class="badge">{cat}</span>
                    ))}
                  </div>
                  <div class="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => handleEdit(product)}
                      class="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      class="text-sm text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div class="text-center py-12 text-gray-400">
              No hay productos. ¡Crea el primero!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
