type CatalogBatchProcessEvent = {
  Records: Array<{ body: string }>;
};

import { createProductRecord } from '../lib/product';

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

  console.log('catalogBatchProcess created products', createdProducts);
};
