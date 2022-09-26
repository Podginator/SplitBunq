export class Amount { 
    currency!: string;
    value!: string; 
}

export class LabelCard { 
    type!: string; 
    second_line!: string;
}

export interface WrappedMastercardAction { 
    MasterCardAction: MastercardPayment;
}

export interface MastercardPayment {
    id: string; 
    created: string; 
    updated: string; 
    monetary_account_id: string; 
    amount_local: Amount;
    description: string; 
    label_card: LabelCard;
    card_id: number;
}