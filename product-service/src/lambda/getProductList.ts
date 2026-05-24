import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { documentClient } from '../lib/dynamo';
import { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } from '../lib/constants';

export const handler = async () => {
  const [productsResult, stocksResult] = await Promise.all([
    documentClient.send(
      new ScanCommand({
        TableName: PRODUCTS_TABLE_NAME,
      })
    ),
    documentClient.send(
      new ScanCommand({
        TableName: STOCKS_TABLE_NAME,
      })
    ),
  ]);

  const products = productsResult.Items ?? [];
  const stocks = stocksResult.Items ?? [];
  const stockByProductId = new Map(
    stocks.map((stock) => [stock.product_id, stock.count])
  );

  const joinedProducts = products.map((product) => ({
    ...product,
    count: stockByProductId.get(product.id) ?? 0,
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(joinedProducts),
  };
};
