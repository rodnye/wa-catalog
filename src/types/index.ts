export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  moneda: string;
  imagenes: string[];
  categorias: string[];
  destacado: boolean;
  disponible: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}
