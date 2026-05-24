import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { documentClient } from '../lib/dynamo';
import { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } from '../lib/constants';

export const handler = async (event: any) => {
  const productId = event.pathParameters?.productId;

  if (!productId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Product id is required' }),
    };
  }

  const [productResult, stockResult] = await Promise.all([
    documentClient.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE_NAME,
        Key: { id: productId },
      })
    ),
    documentClient.send(
      new GetCommand({
        TableName: STOCKS_TABLE_NAME,
        Key: { product_id: productId },
      })
    ),
  ]);

  const product = productResult.Item;

  if (!product) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Product not found' }),
    };
  }

  const stock = stockResult.Item;
  const joinedProduct = {
    ...product,
    count: stock?.count ?? 0,
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(joinedProduct),
  };
};
