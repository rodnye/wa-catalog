import { userStore } from '@/stores/authStore';
import { DecapGateway, type FileEntry } from '@rodny/decap-gateway';
import { logger } from '@catalog/shared/src/logger';

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
  if (!user) {
    logger.error('User is not logged in, cannot get commit author');
    throw new Error('User is not logued');
  }

  const author = { name: user.userMetadata.fullName!, email: user.email! };
  logger.debug({ author }, 'Commit author resolved');
  return author;
}

export function getGateway(): DecapGateway {
  if (!gatewayInstance) {
    logger.debug(
      {
        identityUrl: IDENTITY_URL,
        gatewayUrl: GATEWAY_URL,
        repo: REPO,
        branch: BRANCH,
      },
      'Initializing new gateway instance',
    );
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
  logger.info({ email }, 'Gateway login attempt');
  const gw = getGateway();
  try {
    const result = await gw.login(email, password, true);
    logger.info({ email }, 'Gateway login successful');
    return result;
  } catch (error) {
    logger.error(
      { email, error: error instanceof Error ? error.message : String(error) },
      'Gateway login failed',
    );
    throw error;
  }
}

export async function gatewayRestore() {
  logger.debug('Gateway restore attempt');
  const gw = getGateway();
  try {
    const result = await gw.restore();
    if (result) {
      logger.debug('Gateway restore successful');
    } else {
      logger.debug('Gateway restore returned no user');
    }
    return result;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Gateway restore failed',
    );
    throw error;
  }
}

export async function gatewayLogout(): Promise<void> {
  logger.info('Gateway logout');
  const gw = getGateway();
  gw.logout();
  logger.info('Gateway logout completed');
}

export async function listDirectory(
  path: string,
): Promise<{ name: string; path: string; type: string }[]> {
  logger.debug({ path }, 'Listing directory');
  const gw = getGateway();
  try {
    const files = await gw.operations.listFiles(path);
    logger.debug(
      { path, fileCount: files.length },
      'Directory listed successfully',
    );
    return files.map((f) => ({
      name: f.path.split('/').pop() || f.path,
      path: f.path,
      type: 'file',
    }));
  } catch (error) {
    logger.error(
      { path, error: error instanceof Error ? error.message : String(error) },
      'Failed to list directory',
    );
    throw error;
  }
}

export async function getFileContent(path: string): Promise<string> {
  logger.debug({ path }, 'Reading file content');
  const gw = getGateway();
  try {
    const content = await gw.operations.readFile(path);
    logger.debug(
      { path, size: content.length },
      'File content read successfully',
    );
    return content;
  } catch (error) {
    logger.error(
      { path, error: error instanceof Error ? error.message : String(error) },
      'Failed to read file content',
    );
    throw error;
  }
}

export async function getFileSha(path: string): Promise<string | null> {
  logger.debug({ path }, 'Getting file SHA');
  const gw = getGateway();
  try {
    const sha = await gw.operations.readFileSha(path);
    logger.debug({ path, sha: sha || 'null' }, 'File SHA retrieved');
    return sha;
  } catch (error) {
    logger.error(
      { path, error: error instanceof Error ? error.message : String(error) },
      'Failed to get file SHA',
    );
    throw error;
  }
}

export async function updateFile(
  path: string,
  content: string,
  message: string,
): Promise<void> {
  logger.info({ path, message, contentSize: content.length }, 'Updating file');
  const gw = getGateway();
  try {
    await gw.operations.writeFiles([{ path, content }], {
      commitMessage: message,
      author: getCommitAuthor(),
      branch: BRANCH,
    });
    logger.info({ path }, 'File updated successfully');
  } catch (error) {
    logger.error(
      { path, error: error instanceof Error ? error.message : String(error) },
      'Failed to update file',
    );
    throw error;
  }
}

export async function uploadBinaryFiles(
  entries: FileEntry[],
  message: string,
): Promise<void> {
  logger.info(
    { entryCount: entries.length, message },
    'Uploading binary files',
  );
  const gw = getGateway();
  try {
    await gw.operations.writeFiles(entries, {
      commitMessage: message,
      author: getCommitAuthor(),
      branch: BRANCH,
    });
    logger.info(
      { entryCount: entries.length },
      'Binary files uploaded successfully',
    );
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Failed to upload binary files',
    );
    throw error;
  }
}

export async function deleteFiles(
  paths: string[],
  message: string,
): Promise<void> {
  logger.info({ pathCount: paths.length, message }, 'Deleting files');
  const gw = getGateway();
  try {
    await gw.operations.deleteFiles(paths, {
      commitMessage: message,
      author: getCommitAuthor(),
    });
    logger.info({ pathCount: paths.length }, 'Files deleted successfully');
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Failed to delete files',
    );
    throw error;
  }
}
