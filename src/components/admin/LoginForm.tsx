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
      await login(email, password);
      navigate(resolveUrlBase('/admin/v2'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    navigate(resolveUrlBase('/admin/v2'));
    return null;
  }

  return (
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
  );
}
