import * as AWS from "aws-sdk";
import { AWSError } from "aws-sdk";
import { SNS } from "aws-sdk";
import { Logger } from "winston";
import { CartItem } from "../models/CartItem";
import { createLogger } from "../utils/logger";

export class OrderSNSNotifier{
  
    private readonly snsClient:SNS;
    private readonly logger:Logger;

    constructor(){
        this.snsClient = new AWS.SNS({apiVersion: '2010-03-31'});
        this.logger = createLogger('notifierLayer::OrderSNSNotifier');
    }


    async createTopic(topicId: string): Promise<string> {
        
        this.logger.info("Creating topic ", {topicId});
        var topicARN = undefined;

        await this.snsClient.createTopic({Name: topicId}).promise()
        .then((data) => {
            topicARN = data.TopicArn;
            this.logger.info("Topic created ",{topicARN});
        })
        .catch((err: AWSError) => {
            this.logger.error("Create topic process ERROR:", err);
        });

        return topicARN;

    }

    async subscribeMailTopic(topicARN: string, email: string): Promise<string> {
        
        this.logger.info("subscribing topic ", {topicARN, email});
        var subscriptionArn = undefined;

        var params = {
            Protocol: 'EMAIL', 
            TopicArn: topicARN,
            Endpoint: email
          };

        await this.snsClient.subscribe(params).promise()
        .then((data) => {
            subscriptionArn = data.SubscriptionArn;
            this.logger.info("subscription created",{subscriptionArn});
        })
        .catch((err: AWSError) => {
            this.logger.error("Create subscription process ERROR:", err);
        });

        return subscriptionArn;

    }

    async unsubscribeTopic(topicARN:string): Promise<boolean> {
        
        this.logger.info("unsubscribing topic", {topicARN});
        var subscriptionArn = undefined;

        const params = {
            TopicArn : topicARN
        }

        var list:SNS.SubscriptionsList = undefined;
        await this.snsClient.listSubscriptionsByTopic(params).promise()
        .then((data) => {
            list = data.Subscriptions;
            this.logger.info("subscription list ",list);
        })
        .catch((err: AWSError) => {
            this.logger.error("subscription list process ERROR:", err);
        });

        for (var i=0; list!=undefined && i<list.length; i++){
            const subsARN = list[i].SubscriptionArn;
            await this.snsClient.unsubscribe({SubscriptionArn : subsARN}).promise()
            .then((_data) => {
                this.logger.info("unsubscription OK ",subsARN);
            })
            .catch((err: AWSError) => {
                this.logger.error("unsubscription process ERROR:", err);
            });
        }

        return subscriptionArn;

    }


    async notifyOrder(topicARN: string, item: CartItem): Promise<string> {
        
        this.logger.info("Notifying ", {topicARN, item});
        var messageId = undefined;

        var params = {
            Message: item.dishName+' '+item.amount+' '+item.price+' $',
            TopicArn: topicARN
        };
        
        await this.snsClient.publish(params).promise()
        .then((data) => {
            messageId =  data.MessageId;
            this.logger.info("MessageID is:",messageId);
        })
        .catch((err: AWSError) => {
            this.logger.error("ERROR sending notification:", err);
        });

        return messageId;

    }

    async deleteTopic(topicARN: string): Promise<boolean> {

        this.logger.info("Deleting topic ",{topicARN});

        await this.snsClient.deleteTopic({TopicArn: topicARN}).promise()
        .then((_data) => {
            this.logger.info("Topic deleted ",topicARN);
            return true;
        })
        .catch((err: AWSError) => {
            this.logger.error("Create topic process ERROR:", err);
        });

        return false;

    }

}