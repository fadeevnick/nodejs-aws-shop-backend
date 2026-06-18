import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } from './constants';
import { documentClient } from './dynamo';

export type ProductInput = {
  title: string;
  description?: string;
  price: number;
  count: number;
};

export type ProductRecord = {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
};

export async function createProductRecord(input: ProductInput): Promise<ProductRecord> {
  const product = {
    id: randomUUID(),
    title: input.title,
    description: input.description ?? '',
    price: input.price,
    count: input.count,
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

  return product;
}
