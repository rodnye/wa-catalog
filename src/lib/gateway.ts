import { userStore } from '@/stores/authStore';
import { refreshToken } from './auth';

const GATEWAY_URL =
  import.meta.env.PUBLIC_GATEWAY_URL || 'https://gateway.decapbridge.com';
const REPO = import.meta.env.PUBLIC_REPO || 'rodnye/wa-catalog';
const BRANCH = import.meta.env.PUBLIC_REPO_BRANCH || 'maite/data';
const API_ROOT = `${GATEWAY_URL}/github`;

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const user = userStore.get();
  if (!user) throw new Error('No autenticado');

  const url = `${API_ROOT}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user.access_token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && retry) {
    const newUser = await refreshToken();
    if (newUser) {
      return request<T>(path, options, false);
    } else {
      throw new Error('Sesión expirada, inicia sesión nuevamente');
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error ${response.status}: ${text}`);
  }

  if (response.status === 204) return null as T;

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return response.text() as Promise<T>;
}

/**
 * Obtener contenido de un archivo
 */
export async function getFileContent(path: string): Promise<string> {
  const data = await request<{ content: string; encoding: string }>(
    `/repos/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`,
  );
  if (data.encoding === 'base64') {
    return atob(data.content.replace(/\n/g, ''));
  }
  return data.content;
}

/**
 * Obtener lista de archivos en un directorio
 */
export async function listDirectory(
  path: string,
): Promise<{ name: string; path: string; type: string }[]> {
  const data = await request<{ name: string; path: string; type: string }[]>(
    `/repos/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`,
  );
  return data.map((item) => ({
    name: item.name,
    path: item.path,
    type: item.type,
  }));
}

/**
 * Crear o actualizar un archivo de texto
 */
export async function updateFile(
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<void> {
  const body: any = {
    message,
    content: btoa(content),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  await request(`/repos/${REPO}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 *  Eliminar un archivo
 */
export async function deleteFile(
  path: string,
  message: string,
  sha: string,
): Promise<void> {
  await request(`/repos/${REPO}/contents/${encodeURIComponent(path)}`, {
    method: 'DELETE',
    body: JSON.stringify({
      message,
      sha,
      branch: BRANCH,
    }),
  });
}

/**
 *  Obtener SHA de un archivo
 */
export async function getFileSha(path: string): Promise<string | null> {
  try {
    const data = await request<{ sha: string }>(
      `/repos/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`,
    );
    return data.sha;
  } catch {
    return null;
  }
}
