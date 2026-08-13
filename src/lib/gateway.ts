import { userStore } from '@/stores/authStore';
import { DecapGateway, type FileEntry } from '@rodny/decap-gateway';

const IDENTITY_URL = import.meta.env.PUBLIC_DECAPBRIDGE_ID
  ? `https://auth.decapbridge.com/sites/${import.meta.env.PUBLIC_DECAPBRIDGE_ID}`
  : 'https://auth.decapbridge.com/sites/b24d4304-f503-45ca-b408-da24db405ebb';

const GATEWAY_URL =
  import.meta.env.PUBLIC_GATEWAY_URL || 'https://gateway.decapbridge.com';

const REPO = import.meta.env.PUBLIC_REPO || 'rodnye/wa-catalog';

const BRANCH = import.meta.env.PUBLIC_REPO_BRANCH || 'maite/data';

let gatewayInstance: DecapGateway | null = null;

export function getCommitAuthor() {
  const user = userStore.get();
  if (!user) throw new Error('User is not logued');

  return { name: user.userMetadata.fullName!, email: user.email! };
}

export function getGateway(): DecapGateway {
  if (!gatewayInstance) {
    gatewayInstance = new DecapGateway({
      identityUrl: IDENTITY_URL,
      gatewayUrl: GATEWAY_URL,
      repo: REPO,
      branch: BRANCH,
    });
  }
  return gatewayInstance;
}

export async function gatewayLogin(email: string, password: string) {
  const gw = getGateway();
  return gw.login(email, password, true);
}

export async function gatewayRestore() {
  const gw = getGateway();
  return gw.restore();
}

export async function gatewayLogout(): Promise<void> {
  const gw = getGateway();
  gw.logout();
}

export async function listDirectory(
  path: string,
): Promise<{ name: string; path: string; type: string }[]> {
  const gw = getGateway();
  const files = await gw.operations.listFiles(path);
  return files.map((f) => ({
    name: f.path.split('/').pop() || f.path,
    path: f.path,
    type: 'file',
  }));
}

export async function getFileContent(path: string): Promise<string> {
  const gw = getGateway();
  return gw.operations.readFile(path);
}

export async function getFileSha(path: string): Promise<string | null> {
  const gw = getGateway();
  return gw.operations.readFileSha(path);
}

export async function updateFile(
  path: string,
  content: string,
  message: string,
): Promise<void> {
  const gw = getGateway();
  await gw.operations.writeFiles([{ path, content }], {
    commitMessage: message,
    author: getCommitAuthor(),
    branch: BRANCH,
  });
}

export async function uploadBinaryFiles(
  entries: FileEntry[],
  message: string,
): Promise<void> {
  const gw = getGateway();
  await gw.operations.writeFiles(entries, {
    commitMessage: message,
    author: getCommitAuthor(),
    branch: BRANCH,
  });
}

export async function deleteFiles(
  paths: string[],
  message: string,
): Promise<void> {
  const gw = getGateway();
  await gw.operations.deleteFiles(paths, {
    commitMessage: message,
    author: getCommitAuthor(),
  });
}
