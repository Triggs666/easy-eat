import { Logger } from "winston";
import { TopicDBAccess } from "../dataLayer/topicAccess";
import { CartItem } from "../models/CartItem";
import { OrderSNSNotifier } from "../notifierLayer/OrderNotifier";
import { createLogger } from "../utils/logger";

export class Topics{

    private readonly logger:Logger;
    private readonly dbAccess:TopicDBAccess;
    private readonly notifier:OrderSNSNotifier;

    constructor(){
        this.logger = createLogger('businessLayer::topics');
        this.notifier = new OrderSNSNotifier();
        this.dbAccess = new TopicDBAccess();
    }

    async getTopicARNByRestId(restId: string): Promise<string> {
        return undefined;
    }

    async notifyOrder(topicARN: string, item: CartItem): Promise<string> {
        return undefined;
    }

}
        