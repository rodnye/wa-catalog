import { userStore } from '@/stores/authStore';
import { gatewayLogin, gatewayLogout, gatewayRestore } from './gateway';

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
  return user;
}

export async function logout(): Promise<void> {
  await gatewayLogout();
  userStore.set(null);
}

export async function restoreSession(): Promise<User | null> {
  try {
    const authUser = await gatewayRestore();
    if (!authUser) return null;

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
    return user;
  } catch {
    userStore.set(null);
    return null;
  }
}
