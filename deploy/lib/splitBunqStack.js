require('dotenv').config();
const lambda = require('@aws-cdk/aws-lambda');
const cdk = require('@aws-cdk/core');
const path = require('path');
const apigw = require('@aws-cdk/aws-apigateway');
const wafv2 = require('@aws-cdk/aws-wafv2');

const { SPLITWISE_API_KEY, CDK_ACCOUNT, CDK_REGION } = process.env;

class SplitBunqStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, {
      ...props,
      env: {
        account: CDK_ACCOUNT,
        region: CDK_REGION,
      },
    });

    const lambdaFn = new lambda.Function(this, 'SplitwiseLambda', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        SPLITWISE_API_KEY,
      },
    });


    const gateway = new apigw.RestApi(this, 'SplitBunqWafApi', {
      endpointTypes: [apigw.EndpointType.REGIONAL],
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        stageName: 'prod',
        methodOptions: {
          '/*/*': {
            throttlingRateLimit: 100,
            throttlingBurstLimit: 200,
          },
        },
      },
    });

    const basePath = gateway.root.addResource('split');

    let lambdaIntegration = new apigw.LambdaIntegration(lambdaFn, {
      proxy: false,
      requestParameters: {'integration.request.header.X-Amz-Invocation-Type': "'Event'"},
      integrationResponses: [
        {
          statusCode: '200',
        },
      ],
    });

    basePath.addMethod('POST', lambdaIntegration, {
      methodResponses: [
        {
          statusCode: '200',
        },
      ],
    });

    const ipSet = new wafv2.CfnIPSet(this, 'BunqIpSet', {
      addresses: ['185.40.108.0/22'],
      ipAddressVersion: 'IPV4',
      scope: 'REGIONAL',

      // the properties below are optional
      description: 'Bunq IP Set where they call their callbacks.',
      name: 'BunqIp',
    });

    const wafRules = [
      {
        name: 'BunqIP',
        priority: 0,
        statement: {
          ipSetReferenceStatement: {
            arn: ipSet.attrArn,
          },
        },
        action: {
          allow: {},
        },
        visibilityConfig: {
          sampledRequestsEnabled: false,
          cloudWatchMetricsEnabled: false,
          metricName: 'BunqIP',
        },
      },
    ];

    const waf = new wafv2.CfnWebACL(this, 'BunqWAF', {
      defaultAction: {
        block: {},
      },
      rules: wafRules,
      visibilityConfig: {
        cloudWatchMetricsEnabled: false,
        metricName: 'BunqWAF',
        sampledRequestsEnabled: false
      },
      scope: "REGIONAL",
      name: "BunqWAF",
      description: "WAF For Bunq Splitwise"
    });

    const apiGatewayARN = `arn:aws:apigateway:${cdk.Stack.of(this).region}::/restapis/${gateway.restApiId}/stages/${gateway.deploymentStage.stageName}`

    // Associate with our gateway
    new wafv2.CfnWebACLAssociation(this, 'WebACLAssociation', {
      name: "WebAclBunqAssoc",
      webAclArn: waf.attrArn,
      resourceArn: apiGatewayARN,
    })
  }
}

module.exports = { CdkStack: SplitBunqStack };
