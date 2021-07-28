import { createLogger } from '../utils/logger'
import { Logger } from 'winston';
import * as uuid from 'uuid'
import { RestaurantItem } from '../models/RestaurantItem';
import { RestaurantDBAccess } from '../dataLayer/restsAccess';
import { CreateRestaurantRequest } from '../requests/CreateRestaurantRequest';
import { UpdateRestaurantRequest } from '../requests/UpdateRestaurantRequest';
import { Topics } from './topics';
import { Dish } from './dishes';
import { DishItem } from '../models/DishItem';
import { StorageAccess } from '../storageLayer/storageAccess';

export class Restaurant{
    private readonly logger:Logger;
    private readonly dbAccess:RestaurantDBAccess;
    private readonly storageAccess:StorageAccess;

    constructor(){
        this.logger = createLogger('businessLayer::RESTAURANTS');
        this.dbAccess = new RestaurantDBAccess();
        this.storageAccess = new StorageAccess();
    }

    async getRestaurantbyUserId(userId: string):Promise<RestaurantItem[]> {

        this.logger.info('getRestaurantbyUserId', {userId})
        return this.dbAccess.getRestListbyUserId(userId);
    
    }

    async getAllRestaurants():Promise<RestaurantItem[]> {

        this.logger.info('getAllRestaurants')
        return this.dbAccess.getAllRestaurants();
    
    }

    async getRestaurantbyRestId(userId: string, restId: string):Promise<RestaurantItem> {

        this.logger.info('getRestListbyRestId', {userId, restId})
        const restItems:RestaurantItem[] = await this.dbAccess.getRestListbyRestId(userId, restId);
        if (restItems==undefined || restItems.length==0){
            return undefined;
        }
        else{
            return restItems[0];
        }
    
    }

    async getRestaurantbyId(restId: string):Promise<RestaurantItem> {

        this.logger.info('getRestaurantbyId', {restId})
        const restItems:RestaurantItem[] = await this.dbAccess.getRestaurantsById(restId);
        if (restItems==undefined || restItems.length==0){
            return undefined;
        }
        else{
            return restItems[0];
        }
    
    }

    async createRestaurantbyUserId(userId: string, newItem:CreateRestaurantRequest):Promise<RestaurantItem> {

        this.logger.info('createRestaurantbyUserId', {userId, newItem});

        const restId = uuid.v4();

        //Create restaurant topic to notify the orders ...

        const topic: Topics = new Topics();
        const topicARN = await topic.createTopicByRestId(restId);
        if (topicARN!=undefined){

             //Create susbscription with restaurant email ...

            const subsId = await topic.subscribeMailTopic(topicARN,newItem.email);
            if (subsId!=undefined){
                this.logger.info('Topic created for restaurant', {restId, topicARN});
            }
            else{
                this.logger.error('Error creating topic for restaurant', {restId});
            }
            
        }
        else{
            this.logger.info('Error creating topic for restaurant', {restId, topicARN});
        }
        
        // Save restaurant item ...

        const newRest:RestaurantItem = {
            userId,
            restId,
            name: newItem.name,
            topicARN
        }

        this.logger.info('createRestaurantbyUserId', {userId, newRest});
        return this.dbAccess.createRestaurant(newRest);
    
    }

    updateRestaurantbyUserRestId(userId: string, restId:string, newItem:UpdateRestaurantRequest):Promise<RestaurantItem> {

        const newRest:RestaurantItem = {
            userId,
            restId,
            name: newItem.name,
            topicARN: ''
        }

        this.logger.info('updateRestaurantbyUserId', {userId, newRest});
        return this.dbAccess.updateRestaurant(newRest);
    
    }

    async deleteRestaurantbyUserId(userId: string, restId: string): Promise<number> {

        //Get full restaurant info ...

        const deleteRest: RestaurantItem = await this.getRestaurantbyRestId(userId, restId);
        if (deleteRest == undefined){
            this.logger.error('restaurant NOT FOUND!', {userId, restId});
            return -1;
        }

        //delete subscriptions and topic ...

        this.logger.info('delete subscriptions', {deleteRest});
        
        const topic: Topics = new Topics();
        await topic.unsubscribeTopic(deleteRest.topicARN);
        await topic.deleteTopic(deleteRest.topicARN);


        //delete all restaurant's dishes ...

        this.logger.info('delete dishes', {deleteRest});

        const dish: Dish = new Dish();
        const dishes: DishItem[] = await dish.getDishesByRestaturant(userId, restId);
        for (var i=0;dishes!=undefined && i<dishes.length;i++){
            const dishItem:DishItem = dishes[i];
            dish.deleteDishbyUserId(userId, restId, dishItem.dishId);
        }

        //delete restaurant ...

        this.logger.info('deleteRestaurantbyUserId', {deleteRest});
        if (await this.dbAccess.deleteRestaurant(deleteRest)){
            return 0;
        }
        else{
            // Error deleting item ...
            return -1;
        }
        
    }

    async getUploadUrl(currentItem:RestaurantItem): Promise<string> {

        const imageId = uuid.v4();
        const signedURL = this.storageAccess.getSignedUploadUrl(imageId);
        const URL = this.storageAccess.getImageUrl(imageId);

        this.logger.info('updateURLDishImage', {currentItem, URL});
        const updatedItem = await this.dbAccess.updateURLRestLogo(currentItem, URL);

        if (updatedItem == undefined) return undefined;  //ERROR updating item!!!

        return signedURL;
    }


}