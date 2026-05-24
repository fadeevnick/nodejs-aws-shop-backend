import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } from '../src/lib/constants';
import { documentClient } from '../src/lib/dynamo';

const seedProducts = [
  {
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
    title: 'ProductOne',
    description: 'Short Product Description1',
    price: 24,
    count: 1,
  },
  {
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80a1',
    title: 'ProductTitle',
    description: 'Short Product Description7',
    price: 15,
    count: 2,
  },
  {
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80a3',
    title: 'Product',
    description: 'Short Product Description2',
    price: 23,
    count: 3,
  },
  {
    id: '7567ec4b-b10c-48c5-9345-fc73348a80a1',
    title: 'ProductTest',
    description: 'Short Product Description4',
    price: 15,
    count: 4,
  },
  {
    id: '7567ec4b-b10c-48c5-9445-fc73c48a80a2',
    title: 'Product2',
    description: 'Short Product Descriptio1',
    price: 23,
    count: 5,
  },
  {
    id: '7567ec4b-b10c-45c5-9345-fc73c48a80a1',
    title: 'ProductName',
    description: 'Short Product Description7',
    price: 15,
    count: 6,
  },
];

async function main() {
  await documentClient.send(
    new BatchWriteCommand({
      RequestItems: {
        [PRODUCTS_TABLE_NAME]: seedProducts.map((product) => ({
          PutRequest: {
            Item: {
              id: product.id,
              title: product.title,
              description: product.description,
              price: product.price,
            },
          },
        })),
        [STOCKS_TABLE_NAME]: seedProducts.map((product) => ({
          PutRequest: {
            Item: {
              product_id: product.id,
              count: product.count,
            },
          },
        })),
      },
    })
  );

  console.log(
    `Seeded ${seedProducts.length} products into "${PRODUCTS_TABLE_NAME}" and "${STOCKS_TABLE_NAME}".`
  );
}

main().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
