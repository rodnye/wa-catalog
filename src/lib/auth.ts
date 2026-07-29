import { userStore } from '@/stores/authStore';

const IDENTITY_URL = import.meta.env.PUBLIC_DECAPBRIDGE_ID
  ? `https://auth.decapbridge.com/sites/${import.meta.env.PUBLIC_DECAPBRIDGE_ID}`
  : 'https://auth.decapbridge.com/sites/b24d4304-f503-45ca-b408-da24db405ebb';

export interface User {
  id: string;
  email: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

export async function login(username: string, password: string): Promise<User> {
  const url = `${IDENTITY_URL}/token`;
  const body = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMsg = `Error ${response.status}: ${text}`;
    try {
      const json = JSON.parse(text);
      if (json.error_description) errorMsg = json.error_description;
      else if (json.msg) errorMsg = json.msg;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const user: User = {
    id: data.user?.id || data.id || '',
    email: data.user?.email || data.email || username,
    access_token: data.access_token || data.token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    user_metadata: data.user?.user_metadata || data.user_metadata || {},
  };
  userStore.set(user);
  return user;
}

export async function logout(): Promise<void> {
  userStore.set(null);
}

export async function refreshToken(): Promise<User | null> {
  const user = userStore.get();
  if (!user || !user.refresh_token) return null;

  const url = `${IDENTITY_URL}/token`;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: user.refresh_token,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    userStore.set(null);
    return null;
  }

  const data = await response.json();
  const newUser: User = {
    ...user,
    access_token: data.access_token || data.token,
    refresh_token: data.refresh_token || user.refresh_token,
    expires_in: data.expires_in,
  };
  userStore.set(newUser);
  return newUser;
}
