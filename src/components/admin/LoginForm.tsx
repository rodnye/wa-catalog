import { useState } from 'preact/hooks';
import { login } from '@/lib/auth';
import { navigate } from 'astro:transitions/client';
import { userStore } from '@/stores/authStore';
import { resolveUrlBase } from '@/utils/helpers';
import { useStore } from '@nanostores/preact';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = useStore(userStore);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      userStore.set(user);
      navigate(resolveUrlBase('/dashboard'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    navigate(resolveUrlBase('/dashboard'));
    return;
  }

  return (
    <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div class="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="email" class="sr-only">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Correo electrónico"
          />
        </div>
        <div>
          <label for="password" class="sr-only">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Contraseña"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        class="group relative justify-self-end flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}
