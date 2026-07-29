import GoTrue, { type UserData } from 'gotrue-js';

const IDENTITY_URL = import.meta.env.PUBLIC_DECAPBRIDGE_ID
  ? `https://auth.decapbridge.com/sites/${import.meta.env.PUBLIC_DECAPBRIDGE_ID}`
  : 'https://auth.decapbridge.com/sites/b24d4304-f503-45ca-b408-da24db405ebb';

let authClient: GoTrue | null = null;

export function getAuthClient(): GoTrue {
  if (!authClient) {
    authClient = new GoTrue({ APIUrl: IDENTITY_URL });
  }
  return authClient;
}

export interface User {
  id: string;
  email: string;
  token: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

export async function login(email: string, password: string): Promise<User> {
  const client = getAuthClient();
  const response = await client.login(email, password, true);

  const user = response as UserData;
  return {
    id: user.id,
    email: user.email,
    token: (user.token as any)?.access_token || user.token,
    user_metadata: user.user_metadata || {},
  };
}

export async function logout(): Promise<void> {
  const client = getAuthClient();
  const user = client.currentUser();
  if (user) {
    await user.logout();
  }
}

export function getCurrentUser(): User | null {
  const client = getAuthClient();
  const user = client.currentUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    token: (user as any).token?.access_token || (user as any).token,
    user_metadata: user.user_metadata || {},
  };
}
