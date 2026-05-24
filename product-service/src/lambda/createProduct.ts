import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } from '../lib/constants';
import { documentClient } from '../lib/dynamo';

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

  const id = randomUUID();
  const product = {
    id,
    title: payload.title,
    description: payload.description ?? '',
    price: payload.price,
    count: payload.count,
  };

  await documentClient.send(
    new PutCommand({
      TableName: PRODUCTS_TABLE_NAME,
      Item: {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
      },
    })
  );

  await documentClient.send(
    new PutCommand({
      TableName: STOCKS_TABLE_NAME,
      Item: {
        product_id: product.id,
        count: product.count,
      },
    })
  );

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(product),
  };
};
