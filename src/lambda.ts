/* eslint-disable */
import { app } from './app';

export const handler = require('aws-lambda-fastify')(app);
