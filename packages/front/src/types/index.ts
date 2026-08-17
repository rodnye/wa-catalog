import type { productSchema } from '@/schemas';
import type { z } from 'astro/zod';

export type IProduct = z.infer<typeof productSchema>;

export interface ICartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ICart {
  items: ICartItem[];
  total: number;
  count: number;
}
