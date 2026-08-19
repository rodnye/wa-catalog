import type z from "zod";
import type { categorySchema, productSchema } from "./schemas";

export type IProduct = z.infer<typeof productSchema>;
export type ICategory = z.infer<typeof categorySchema>;

