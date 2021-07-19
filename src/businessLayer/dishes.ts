import { createLogger } from '../utils/logger'
import { Logger } from 'winston';
import * as uuid from 'uuid'
import { DishItem } from '../models/DishItem';
import { DishDBAccess } from '../dataLayer/dishesAccess';
import { CreateDishRequest } from '../requests/CreateDishRequest';

export class Dish{
    private readonly logger:Logger;
    private readonly dbAccess:DishDBAccess;

    constructor(){
        this.logger = createLogger('businessLayer');
        this.dbAccess = new DishDBAccess();
    }

    async getDishesByRestaturant(userId: string, restId: string):Promise<DishItem[]> {

        this.logger.info('getDishesByRestaturant', {userId, restId})
        return this.dbAccess.getDishListbyRestaurant(userId, restId);
    
    }

    async createDishByRestaturant(userId: string, idRest: string, newItem:CreateDishRequest):Promise<DishItem> {

        const idDish = uuid.v4();

        const newRest:DishItem = {
            idRest,
            idDish,
            userId,
            dishName: newItem.dishName,
            ingridients: newItem.ingridients,
            price: newItem.price
        }

        this.logger.info('createDishByRestaturant', {userId, idRest, idDish, newItem});
        return this.dbAccess.createDishbyRestaurant(newRest);
    
    }

    updateRestaurantbyUserRestId(userId: string, restId:string, newItem:UpdateRestaurantRequest):Promise<DishItem> {

        const newRest:DishItem = {
            userId,
            restId,
            name: newItem.name,
            email: newItem.email
        }

        this.logger.info('updateRestaurantbyUserId', {userId, newRest});
        return this.dbAccess.updateRestaurant(newRest);
    
    }

    async deleteRestaurantbyUserId(userId: string, restId: string): Promise<boolean> {

        const deleteRest:DishItem = {
            userId,
            restId,
            name: '',
            email: ''
        }

        this.logger.info('deleteRestaurantbyUserId', {deleteRest});
        return await this.dbAccess.deleteRestaurant(deleteRest);
    }


}