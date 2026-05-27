import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importBucket = new s3.Bucket(this, 'ImportBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const importProductsFileFn = new lambda.NodejsFunction(this, 'ImportProductsFile', {
      entry: 'src/lambda/importProductsFile.ts',
      handler: 'handler',
      environment: {
        IMPORT_BUCKET_NAME: importBucket.bucketName,
      },
    });

    importBucket.grantWrite(importProductsFileFn);

    const importFileParserFn = new lambda.NodejsFunction(this, 'ImportFileParser', {
      entry: 'src/lambda/importFileParser.ts',
      handler: 'handler',
    });

    importBucket.grantRead(importFileParserFn);
    importBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.LambdaDestination(importFileParserFn),
      { prefix: 'uploaded/' },
    );

    const api = new apigateway.RestApi(this, 'ImportServiceApi', {
      restApiName: 'Import Service API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const importResource = api.root.addResource('import');
    importResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileFn), {
      requestParameters: {
        'method.request.querystring.name': true,
      },
    });
  }
}
