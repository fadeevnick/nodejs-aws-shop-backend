type CatalogBatchProcessEvent = {
  Records: Array<{ body: string }>;
};

import { createProductRecord } from '../lib/product';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

const snsClient = new SNSClient({});
const createProductTopicArn = process.env.CREATE_PRODUCT_TOPIC_ARN;

export const handler = async (event: CatalogBatchProcessEvent) => {
  const createdProducts = [];

  for (const record of event.Records) {
    const payload = JSON.parse(record.body) as {
      title?: string;
      description?: string;
      price?: number;
      count?: number;
    };

    if (!payload.title || payload.price == null || payload.count == null) {
      throw new Error('title, price and count are required in SQS message body');
    }

    const product = await createProductRecord({
      title: payload.title,
      description: payload.description,
      price: payload.price,
      count: payload.count,
    });

    createdProducts.push(product);
  }

  if (!createProductTopicArn) {
    throw new Error('CREATE_PRODUCT_TOPIC_ARN is not configured');
  }

  await snsClient.send(
    new PublishCommand({
      TopicArn: createProductTopicArn,
      Subject: 'Products created',
      Message: JSON.stringify({
        count: createdProducts.length,
        products: createdProducts,
      }),
    })
  );

  console.log('catalogBatchProcess created products', createdProducts);
};
