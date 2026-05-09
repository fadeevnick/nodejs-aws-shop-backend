import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';

const region = process.env.AWS_USER_REGION;

const client = new DynamoDBClient({ region });

const dynamoDbDocClient = DynamoDBDocumentClient.from(client);

const productsToPopulate: Array<{
  title: string;
  description: string;
  price: number;
  count: number;
}> = [
  {
    title: 'Test Product 1',
    description: 'Test product 1 description',
    price: 10,
    count: 5,
  },
  {
    title: 'Test Product 2',
    description: 'Test product 2 description',
    price: 11,
    count: 5,
  },
  {
    title: 'Test Product 3',
    description: 'Test product 3 description',
    price: 12,
    count: 5,
  },
  {
    title: 'Test Product 4',
    description: 'Test product 4 description',
    price: 13,
    count: 5,
  },
  {
    title: 'Test Product 5',
    description: 'Test product 5 description',
    price: 14,
    count: 5,
  },
];

async function seedProducts() {
  for (const { title, description, price, count } of productsToPopulate) {
    const id = uuid();

    await dynamoDbDocClient.send(
      new PutCommand({
        TableName: 'products',
        Item: {
          id,
          title,
          description,
          price,
        },
      }),
    );

    await dynamoDbDocClient.send(
      new PutCommand({
        TableName: 'stocks',
        Item: {
          product_id: id,
          count,
        },
      }),
    );
  }
}

console.log('Seed started...');

seedProducts()
  .then(() => console.log('Seed completed!'))
  .catch((error) => console.error(error));