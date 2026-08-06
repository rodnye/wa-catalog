import { z } from 'astro/zod';

export const productSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),

  price: z.number().positive('Price must be a positive number'),
  currency: z.enum(['CUP', 'USD']).default('CUP'),

  images: z.array(z.string()).default([]),
  categories: z.array(z.string().min(1, 'Category cannot be empty')).min(1),

  vip: z.boolean().default(false),
  featured: z.boolean().default(false),
  available: z.boolean().default(true),
});
