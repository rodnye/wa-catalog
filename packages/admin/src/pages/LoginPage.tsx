import { useLayoutEffect, useState } from 'preact/hooks';
import { login } from '@/lib/auth';
import { userStore } from '@/stores/authStore';
import { useStore } from '@nanostores/preact';
import { baseUrl } from '@/utils/url';
import { route } from 'preact-router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = useStore(userStore);

  useLayoutEffect(() => {
    document.title = "Iniciar sesión - La Gitana Shop"
  }, []);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    route(baseUrl + '/login');
    return null;
  }

  return (
    <div
      class="min-h-dvh flex flex-col items-center justify-center bg-gray-50 px-4 py-12"
    >
      <div class="w-full max-w-sm space-y-8">
        <div class="flex flex-col items-center gap-3">
          <p class="text-sm text-gray-500 text-center">
            Acceso restringido · Solo administradores
          </p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form class="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                class="input-field"
                placeholder="admin@ejemplo.com"
                autocomplete="email"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                class="input-field"
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              class="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>

  );
}
