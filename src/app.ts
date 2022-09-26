import fastify from 'fastify';
import * as errors from './utils/errors';
import * as splitbunq from './routes/splitbunq';
import { logger } from './utils/logging';
import 'reflect-metadata';

export const app = fastify();

errors.addErrorHandler(app);
splitbunq.registerRoutes(app);

if (require.main === module) {
  app.listen(3000, (err) => {
    if (err) logger.error(err);
    logger.log('server listening on 3000');
  });
}