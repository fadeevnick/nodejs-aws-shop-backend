import { createProductRecord } from '../lib/product';

export const handler = async (event: { body?: string | null }) => {
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Request body is required' }),
    };
  }

  const payload = JSON.parse(event.body) as {
    title?: string;
    description?: string;
    price?: number;
    count?: number;
  };

  if (!payload.title || payload.price == null || payload.count == null) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'title, price and count are required' }),
    };
  }

  const product = await createProductRecord({
    title: payload.title,
    description: payload.description,
    price: payload.price,
    count: payload.count,
  });

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(product),
  };
};
