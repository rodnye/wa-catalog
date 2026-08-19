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
