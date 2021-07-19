import { createLogger } from '../utils/logger'
import { Logger } from 'winston';
import * as uuid from 'uuid'
import { RestaurantItem } from '../models/RestaurantItem';
import { RestaurantDBAccess } from '../dataLayer/restsAccess';
import { CreateRestaurantRequest } from '../requests/CreateRestaurantRequest';
import { UpdateRestaurantRequest } from '../requests/UpdateRestaurantRequest';

export class Restaurant{
    private readonly logger:Logger;
    private readonly dbAccess:RestaurantDBAccess;

    constructor(){
        this.logger = createLogger('businessLayer');
        this.dbAccess = new RestaurantDBAccess();
    }

    async getRestaurantbyUserId(userId: string):Promise<RestaurantItem[]> {

        this.logger.info('getREsbyUserId', {userId})
        return this.dbAccess.getRestListbyUserId(userId);
    
    }

    async createRestaurantbyUserId(userId: string, newItem:CreateRestaurantRequest):Promise<RestaurantItem> {

        const restId = uuid.v4();

        const newRest:RestaurantItem = {
            userId,
            restId,
            name: newItem.name,
            email: newItem.email
        }

        this.logger.info('createRestaurantbyUserId', {userId, newRest});
        return this.dbAccess.createRestaurant(newRest);
    
    }

    updateRestaurantbyUserRestId(userId: string, restId:string, newItem:UpdateRestaurantRequest):Promise<RestaurantItem> {

        const newRest:RestaurantItem = {
            userId,
            restId,
            name: newItem.name,
            email: newItem.email
        }

        this.logger.info('updateRestaurantbyUserId', {userId, newRest});
        return this.dbAccess.updateRestaurant(newRest);
    
    }

    async deleteRestaurantbyUserId(userId: string, restId: string): Promise<boolean> {

        const deleteRest:RestaurantItem = {
            userId,
            restId,
            name: '',
            email: ''
        }

        this.logger.info('deleteRestaurantbyUserId', {deleteRest});
        return await this.dbAccess.deleteRestaurant(deleteRest);
    }


}