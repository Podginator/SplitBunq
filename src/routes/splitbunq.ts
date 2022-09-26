import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../utils/logging';
import { WrappedMastercardAction } from '../models/MasterCardAction';
import { BunqNotification } from '../models/BunqNotification';
import { convertCardPaymentToExpense, postExpenseToGroupId } from '../lib/splitwise';

const pushToSplitwiseRoute = async (req: FastifyRequest<{ Body: BunqNotification<WrappedMastercardAction> }>, res: FastifyReply): Promise<void> => {
  const { NotificationUrl: { object }  } = req.body;
  logger.log(`Received Mastercard Action: ${JSON.stringify(req.body)}`);

  const expenses = convertCardPaymentToExpense(object);

  await Promise.all(
    expenses.map(postExpenseToGroupId)
  ) 
    
  res.status(200).send();
};

export function registerRoutes(app: FastifyInstance): void {
  app.route({
    url: '/split',
    method: 'POST',
    handler: pushToSplitwiseRoute,
  });
}
