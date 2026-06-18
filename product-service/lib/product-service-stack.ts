import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: 'products',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const stocksTable = new dynamodb.Table(this, 'StocksTable', {
      tableName: 'stocks',
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const getProductsListFn = new lambda.NodejsFunction(this, 'GetProductsList', {
      entry: 'src/lambda/getProductList.ts',
      handler: 'handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
      },
    });

    const getProductsByIdFn = new lambda.NodejsFunction(this, 'GetProductsById', {
      entry: 'src/lambda/getProductById.ts',
      handler: 'handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
      },
    });

    const createProductFn = new lambda.NodejsFunction(this, 'CreateProduct', {
      entry: 'src/lambda/createProduct.ts',
      handler: 'handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
      },
    });

    const catalogBatchProcessFn = new lambda.NodejsFunction(this, 'CatalogBatchProcess', {
      entry: 'src/lambda/catalogBatchProcess.ts',
      handler: 'handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
        CREATE_PRODUCT_TOPIC_ARN: cdk.Stack.of(this).formatArn({
          service: 'sns',
          resource: 'createProductTopic',
        }),
      },
    });

    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      queueName: 'catalogItemsQueue',
    });

    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
      topicName: 'createProductTopic',
    });

    createProductTopic.addSubscription(
      new subscriptions.EmailSubscription('fadeev1999nikolay@gmail.com')
    );

    productsTable.grantReadData(getProductsListFn);
    stocksTable.grantReadData(getProductsListFn);
    productsTable.grantReadData(getProductsByIdFn);
    stocksTable.grantReadData(getProductsByIdFn);
    productsTable.grantWriteData(createProductFn);
    stocksTable.grantWriteData(createProductFn);
    productsTable.grantWriteData(catalogBatchProcessFn);
    stocksTable.grantWriteData(catalogBatchProcessFn);
    createProductTopic.grantPublish(catalogBatchProcessFn);

    catalogBatchProcessFn.addEventSource(
      new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      })
    );

    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      restApiName: 'Product Service API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      }
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListFn));
    productsResource.addMethod('POST', new apigateway.LambdaIntegration(createProductFn));

    const productResource = productsResource.addResource('{productId}');
    productResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdFn));
  }
}
