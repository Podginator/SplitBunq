import { Context, APIGatewayEvent } from 'aws-lambda';
import { logger } from './utils/logging';
import { WrappedMastercardAction } from './models/MasterCardAction';
import { BunqNotification } from './models/BunqNotification';
import { convertCardPaymentToExpense, postExpenseToGroupId } from './lib/splitwise';

export const handler = async (event: BunqNotification<WrappedMastercardAction>, _: Context): Promise<void> => {
    const { NotificationUrl: { object }  } = event;
    logger.log(`Received Mastercard Action: ${JSON.stringify(event)}`);
  
    const expenses = convertCardPaymentToExpense(object);
  
    await Promise.all(
      expenses.map(postExpenseToGroupId)
    ) 
}
