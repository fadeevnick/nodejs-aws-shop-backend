import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListFn = new lambda.NodejsFunction(this, 'GetProductsList', {
      entry: 'src/lambda/getProductList.ts',
      handler: 'handler',
    });

    const getProductsByIdFn = new lambda.NodejsFunction(this, 'GetProductsById', {
      entry: 'src/lambda/getProductById.ts',
      handler: 'handler',
    });

    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      restApiName: 'Product Service API',
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListFn));

    const productResource = productsResource.addResource('{productId}');
    productResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdFn));
  }
}
