import { userStore } from '@/stores/authStore';
import { refreshToken } from './auth';

const GATEWAY_URL =
  import.meta.env.PUBLIC_GATEWAY_URL || 'https://gateway.decapbridge.com';
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
 * Obtener lista de archivos en un directorio
 */
export async function listDirectory(
  path: string,
): Promise<{ name: string; path: string; type: string }[]> {
  const treeUrl = `/git/trees/${BRANCH}:${path}`;
  const treeData = await request<{
    tree: { path: string; sha: string; type: string }[];
  }>(treeUrl);
  return treeData.tree.map((node) => ({
    name: node.path,
    path: path ? `${path}/${node.path}` : node.path,
    type: node.type === 'tree' ? 'dir' : 'file',
  }));
}

/**
 * Obtener contenido de un archivo usando la Git Data API
 */
export async function getFileContent(path: string): Promise<string> {
  const lastSlash = path.lastIndexOf('/');
  const dir = lastSlash === -1 ? '' : path.substring(0, lastSlash);
  const fileName = lastSlash === -1 ? path : path.substring(lastSlash + 1);

  const treeUrl = `/git/trees/${BRANCH}:${dir}`;
  const treeData = await request<{
    tree: { path: string; sha: string; type: string }[];
  }>(treeUrl);

  const fileNode = treeData.tree.find(
    (node) => node.path === fileName && node.type === 'blob',
  );
  if (!fileNode) throw new Error(`Archivo no encontrado: ${path}`);

  const blobData = await request<{ content: string; encoding: string }>(
    `/git/blobs/${fileNode.sha}`,
  );

  if (blobData.encoding === 'base64') {
    return atob(blobData.content.replace(/\n/g, ''));
  }
  return blobData.content;
}

/**
 * Obtener SHA de un archivo
 */
export async function getFileSha(path: string): Promise<string | null> {
  try {
    const lastSlash = path.lastIndexOf('/');
    const dir = lastSlash === -1 ? '' : path.substring(0, lastSlash);
    const fileName = lastSlash === -1 ? path : path.substring(lastSlash + 1);

    const treeUrl = `/git/trees/${BRANCH}:${dir}`;
    const treeData = await request<{
      tree: { path: string; sha: string; type: string }[];
    }>(treeUrl);
    const fileNode = treeData.tree.find(
      (node) => node.path === fileName && node.type === 'blob',
    );
    return fileNode ? fileNode.sha : null;
  } catch {
    return null;
  }
}

/**
 * Crear o actualizar un archivo usando la Git Data API
 */
export async function updateFile(
  path: string,
  content: string,
  message: string,
): Promise<void> {
  const user = userStore.get();
  if (!user) throw new Error('No autenticado');

  const blobData = await request<{ sha: string }>('/git/blobs', {
    method: 'POST',
    body: JSON.stringify({
      content: btoa(encodeURIComponent(content)),
      encoding: 'base64',
    }),
  });

  const branchData = await request<{ commit: { sha: string } }>(
    `/branches/${encodeURIComponent(BRANCH)}`,
  );
  const currentCommitSha = branchData.commit.sha;

  const commitData = await request<{ tree: { sha: string } }>(
    `/git/commits/${currentCommitSha}`,
  );
  const baseTreeSha = commitData.tree.sha;

  const newTreeSha = await createTreeWithFile(path, blobData.sha, baseTreeSha);

  const newCommitData = await request<{ sha: string }>('/git/commits', {
    method: 'POST',
    body: JSON.stringify({
      message,
      tree: newTreeSha,
      parents: [currentCommitSha],
    }),
  });

  await request(`/git/refs/heads/${encodeURIComponent(BRANCH)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      sha: newCommitData.sha,
    }),
  });
}

/**
 * Helper recursivo para crear un tree con un archivo actualizado
 */
async function createTreeWithFile(
  filePath: string,
  blobSha: string,
  baseTreeSha: string,
): Promise<string> {
  const parts = filePath.split('/').filter(Boolean);
  const fileName = parts.pop()!;

  async function buildTree(
    parts: string[],
    currentBaseSha: string,
  ): Promise<string> {
    if (parts.length === 0) {
      const newTree = await request<{ sha: string }>('/git/trees', {
        method: 'POST',
        body: JSON.stringify({
          base_tree: currentBaseSha,
          tree: [
            {
              path: fileName,
              mode: '100644',
              type: 'blob',
              sha: blobSha,
            },
          ],
        }),
      });
      return newTree.sha;
    }

    const currentPart = parts[0];
    const remainingParts = parts.slice(1);

    const treeData = await request<{
      tree: { path: string; sha: string; type: string }[];
    }>(`/git/trees/${currentBaseSha}`);
    const node = treeData.tree.find(
      (n) => n.path === currentPart && n.type === 'tree',
    );
    const childBaseSha = node ? node.sha : null;

    if (!childBaseSha) {
      throw new Error(`El directorio ${currentPart} no existe en el tree`);
    }

    const newChildSha = await buildTree(remainingParts, childBaseSha);

    const newTree = await request<{ sha: string }>('/git/trees', {
      method: 'POST',
      body: JSON.stringify({
        base_tree: currentBaseSha,
        tree: [
          {
            path: currentPart,
            mode: '040000',
            type: 'tree',
            sha: newChildSha,
          },
        ],
      }),
    });
    return newTree.sha;
  }

  return buildTree(parts, baseTreeSha);
}

/**
 * Eliminar un archivo usando la Git Data API
 */
export async function deleteFile(
  path: string,
  message: string,
  _sha?: string,
): Promise<void> {
  const user = userStore.get();
  if (!user) throw new Error('No autenticado');

  const branchData = await request<{ commit: { sha: string } }>(
    `/branches/${encodeURIComponent(BRANCH)}`,
  );
  const currentCommitSha = branchData.commit.sha;

  const commitData = await request<{ tree: { sha: string } }>(
    `/git/commits/${currentCommitSha}`,
  );
  const baseTreeSha = commitData.tree.sha;

  const newTreeSha = await createTreeWithoutFile(path, baseTreeSha);

  const newCommitData = await request<{ sha: string }>('/git/commits', {
    method: 'POST',
    body: JSON.stringify({
      message,
      tree: newTreeSha,
      parents: [currentCommitSha],
    }),
  });

  await request(`/git/refs/heads/${encodeURIComponent(BRANCH)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      sha: newCommitData.sha,
    }),
  });
}

/**
 * Helper recursivo para crear un tree sin un archivo
 */
async function createTreeWithoutFile(
  filePath: string,
  baseTreeSha: string,
): Promise<string> {
  const parts = filePath.split('/').filter(Boolean);
  const fileName = parts.pop()!;

  async function buildTree(
    parts: string[],
    currentBaseSha: string,
  ): Promise<string> {
    if (parts.length === 0) {
      const treeData = await request<{ tree: any[] }>(
        `/git/trees/${currentBaseSha}`,
      );
      const newTreeEntries = treeData.tree.filter((n) => n.path !== fileName);

      const newTree = await request<{ sha: string }>('/git/trees', {
        method: 'POST',
        body: JSON.stringify({
          tree: newTreeEntries,
        }),
      });
      return newTree.sha;
    }

    const currentPart = parts[0];
    const remainingParts = parts.slice(1);

    const treeData = await request<{
      tree: { path: string; sha: string; type: string }[];
    }>(`/git/trees/${currentBaseSha}`);
    const node = treeData.tree.find(
      (n) => n.path === currentPart && n.type === 'tree',
    );
    if (!node) throw new Error(`El directorio ${currentPart} no existe`);

    const newChildSha = await buildTree(remainingParts, node.sha);

    const newTree = await request<{ sha: string }>('/git/trees', {
      method: 'POST',
      body: JSON.stringify({
        base_tree: currentBaseSha,
        tree: [
          {
            path: currentPart,
            mode: '040000',
            type: 'tree',
            sha: newChildSha,
          },
        ],
      }),
    });
    return newTree.sha;
  }

  return buildTree(parts, baseTreeSha);
}
