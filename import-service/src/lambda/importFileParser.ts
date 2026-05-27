import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3Event } from 'aws-lambda';
import csv from 'csv-parser';
import { Readable } from 'node:stream';

const s3Client = new S3Client({});

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

function parseCsvStream(stream: Readable) {
  return new Promise<void>((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', (record) => {
        console.log('CSV record', record);
      })
      .on('error', reject)
      .on('end', resolve);
  });
}
