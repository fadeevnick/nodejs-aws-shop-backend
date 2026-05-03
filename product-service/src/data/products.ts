export interface Product {
    id: string;
    title: string;
    price: number
}

export const products: Product[] = [
  { id: '1', title: 'Product 1', price: 100 },
  { id: '2', title: 'Product 2', price: 200 },
  { id: '3', title: 'Product 3', price: 300 },
  { id: '4', title: 'Product 4', price: 400 },
  { id: '4', title: 'Product 5', price: 500 },
];