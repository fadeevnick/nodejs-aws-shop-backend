import { products } from '../data/products';

export const handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(products),
  };
};
