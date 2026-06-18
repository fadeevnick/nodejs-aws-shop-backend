import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { S3Event } from 'aws-lambda';
import csv from 'csv-parser';
import { Readable } from 'node:stream';

const s3Client = new S3Client({});
const sqsClient = new SQSClient({});
const catalogItemsQueueUrl = process.env.CATALOG_ITEMS_QUEUE_URL;

export const handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );

    if (!(response.Body instanceof Readable)) {
      throw new Error(`Unexpected S3 object body for ${bucketName}/${objectKey}`);
    }

    await parseCsvStream(response.Body);
  }
};

async function parseCsvStream(stream: Readable) {
  if (!catalogItemsQueueUrl) {
    throw new Error('CATALOG_ITEMS_QUEUE_URL is not configured');
  }

  const csvStream = stream.pipe(csv());

  for await (const record of csvStream) {
    const payload = mapCsvRecordToProduct(record as Record<string, string>);

    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: catalogItemsQueueUrl,
        MessageBody: JSON.stringify(payload),
      })
    );
  }
}

function mapCsvRecordToProduct(record: Record<string, string>) {
  const price = Number(record.price);
  const count = Number(record.count);

  if (!record.title || Number.isNaN(price) || Number.isNaN(count)) {
    throw new Error(`Invalid CSV record: ${JSON.stringify(record)}`);
  }

  return {
    title: record.title,
    description: record.description ?? '',
    price,
    count,
  };
}
