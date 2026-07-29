import type { User } from '@/lib/auth';
import { persistentJSON } from '@nanostores/persistent';

export const userStore = persistentJSON<User>('user', null);
