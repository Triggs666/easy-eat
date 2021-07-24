import { Logger } from "winston";
import { CartItem } from "../models/CartItem";
import { OrderSNSNotifier } from "../notifierLayer/OrderNotifier";
import { createLogger } from "../utils/logger";

export class Topics{

    private readonly logger:Logger;
    private readonly notifier:OrderSNSNotifier;

    constructor(){
        this.logger = createLogger('businessLayer::topics');
        this.notifier = new OrderSNSNotifier();
    }

    async createTopicByRestId(restId: string): Promise<string> {
        this.logger.info('createTopicByRestId', {restId});
        return this.notifier.createTopic(restId);
    }

    async notifyOrder(topicARN: string, item: CartItem): Promise<string> {
        return undefined;
    }

    async subscribeMailTopic(topicARN: string, email: string): Promise<string> {
        return undefined;
    }

    async deleteTopic(topicARN: string): Promise<boolean> {
        return undefined;
    }

}
        