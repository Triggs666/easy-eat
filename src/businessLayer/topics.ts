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
        this.logger.info('notifyOrder', {topicARN, item});
        return this.notifier.notifyOrder(topicARN, item);
    }

    async subscribeMailTopic(topicARN: string, email: string): Promise<string> {
        this.logger.info('subscribeMailTopic', {topicARN, email});
        return this.notifier.subscribeMailTopic(topicARN, email);
    }

    async unsubscribeTopic(topicARN: string): Promise<boolean> {
        this.logger.info('subscribeMailTopic', {topicARN});
        return this.notifier.unsubscribeTopic(topicARN);
    }

    async deleteTopic(topicARN: string): Promise<boolean> {
        this.logger.info('deleteTopic', {topicARN});
        return this.notifier.deleteTopic(topicARN);
    }

}
        