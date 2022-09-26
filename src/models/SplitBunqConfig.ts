
export enum ConfigType { 
    MASTERCARD_NUMBERS = "MASTERCARD",
    MAESTRO_ID = "MAESTRO", 
    CARD_ID = "CARD_ID"
}

export interface SplitBunqConfig { 
    groupId: number; 
    type: ConfigType;
    value: string | number;
}