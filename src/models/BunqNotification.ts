export interface Notification<ObjectType> { 
    target_url: string;

    category: string;

    event_type: string;

    object: ObjectType;  
}

export interface BunqNotification<ObjectType> { 
     NotificationUrl: Notification<ObjectType> 
}