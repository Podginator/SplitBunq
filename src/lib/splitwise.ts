import { logger } from '../utils/logging';
import axios from 'axios';
import { SplitwiseExpense } from '../models/SplitwiseExpense';
import { MastercardPayment, WrappedMastercardAction } from '../models/MasterCardAction';
import { configurations } from '../config/config';
import { ConfigType, SplitBunqConfig } from '../models/SplitBunqConfig';

const { SPLITWISE_API_KEY } = process.env; 

export const postExpenseToGroupId = async (expense: SplitwiseExpense): Promise<void> => {
    logger.log(`Adding expense ${JSON.stringify(expense)}`);
  
    return axios
      .post(`https://secure.splitwise.com/api/v3.0/create_expense`, expense, {
          headers: { "Authorization": `Bearer ${SPLITWISE_API_KEY}`}
      })
      .then(it => { 
        logger.log(`Received Response ${it.status} with ${JSON.stringify(it.data)}`);
      })
};

const convertPaymentToExpese = (payment: MastercardPayment) => (config: SplitBunqConfig): SplitwiseExpense  => ({ 
    cost: payment.amount_local.value,
    currency_code: payment.amount_local.currency,
    group_id: config.groupId,
    description: payment.description,
    split_equally: true
})

const isMatchedPayment = (payment: MastercardPayment) => (config: SplitBunqConfig) => { 
    const {type, second_line: cardName} = payment.label_card;

    return (type === config.type && cardName === config.value) 
     || (config.type == ConfigType.CARD_ID && payment.card_id === config.value);
}

export const convertCardPaymentToExpense = ({ MasterCardAction }: WrappedMastercardAction): SplitwiseExpense[] => { 
    return configurations
        .filter(isMatchedPayment(MasterCardAction))
        .map(convertPaymentToExpese(MasterCardAction))
}; 