import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({});
const importBucketName = process.env.IMPORT_BUCKET_NAME;

export const handler = async (event: { queryStringParameters?: { name?: string } | null }) => {
  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' },
      body: 'Missing required query parameter: name',
    };
  }

  if (!importBucketName) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' },
      body: 'Import bucket is not configured',
    };
  }

  const command = new PutObjectCommand({
    Bucket: importBucketName,
    Key: `uploaded/${fileName}`,
    ContentType: 'text/csv',
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' },
    body: signedUrl,
  };
};
