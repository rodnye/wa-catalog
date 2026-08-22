import { userStore } from '@/stores/authStore';
import { gatewayLogin, gatewayLogout, gatewayRestore } from './gateway';
import { logger } from '@catalog/shared/src/logger';

export interface User {
  id: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  userMetadata: {
    fullName?: string;
    avatarUrl?: string;
  };
}

export async function login(username: string, password: string): Promise<User> {
  logger.info({ username }, 'Login attempt started');

  try {
    const authUser = await gatewayLogin(username, password);

    const user: User = {
      id: authUser.id || '',
      email: authUser.email || username,
      accessToken: authUser.token || '',
      refreshToken: undefined,
      expiresIn: undefined,
      userMetadata: {
        fullName: authUser.userMetadata?.full_name as string,
        avatarUrl: authUser.userMetadata?.avatar_url as string,
      },
    };

    userStore.set(user);
    logger.info({ userId: user.id, email: user.email }, 'Login successful');
    return user;
  } catch (error) {
    logger.error(
      {
        username,
        error: error instanceof Error ? error.message : String(error),
      },
      'Login failed',
    );
    throw error;
  }
}

export async function logout(): Promise<void> {
  logger.info('Logout started');
  try {
    await gatewayLogout();
    userStore.set(null);
    logger.info('Logout completed successfully');
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Logout failed',
    );
    throw error;
  }
}

export async function restoreSession(): Promise<User | null> {
  logger.info('Session restore attempt started');

  try {
    const authUser = await gatewayRestore();
    if (!authUser) {
      logger.info('No session to restore');
      return null;
    }

    const user: User = {
      id: authUser.id || '',
      email: authUser.email || '',
      accessToken: authUser.token || '',
      userMetadata: {
        fullName: authUser.userMetadata?.full_name as string,
        avatarUrl: authUser.userMetadata?.avatar_url as string,
      },
    };

    userStore.set(user);
    logger.info(
      { userId: user.id, email: user.email },
      'Session restored successfully',
    );
    return user;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Session restore failed',
    );
    userStore.set(null);
    return null;
  }
}
