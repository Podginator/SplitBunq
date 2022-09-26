import { logger } from './logging';
import { FastifyError, FastifyInstance } from 'fastify';

export const addErrorHandler = (app: FastifyInstance): void => {
  app.setErrorHandler((err: FastifyError, req, reply) => {
    if (!err) {
      reply.status(500).send();
      return;
    }

    logger.error(`Error occured in ${req.routerPath} ${req.routerMethod} ${JSON.stringify(err)}`);

    if (err.statusCode) {
      reply.status(err.statusCode).send(err);
      return;
    }

    if (err.validation) {
      reply.status(400).send(err);
      return;
    }

    reply.status(500).send(err);
  });
};
