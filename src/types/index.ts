import type { productSchema } from "@/schemas";
import type { z } from "astro/zod";

export type Product = z.infer<typeof productSchema>;

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}
