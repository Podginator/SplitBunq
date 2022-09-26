#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { CdkStack: SplitBunqApiGw } = require('../lib/splitBunqStack');

const app = new cdk.App();
new SplitBunqApiGw(app, 'SplitBunq');
