import { createLogger } from '../utils/logger'
import { Logger } from 'winston';
import * as uuid from 'uuid'
import { DishItem } from '../models/DishItem';
import { DishDBAccess } from '../dataLayer/dishesAccess';
import { CreateDishRequest } from '../requests/CreateDishRequest';
import { UpdateDishRequest } from '../requests/UpdateDishRequest';

export class Dish{
    private readonly logger:Logger;
    private readonly dbAccess:DishDBAccess;

    constructor(){
        this.logger = createLogger('businessLayer');
        this.dbAccess = new DishDBAccess();
    }

    async getDishesByRestaturant(userId: string, restId: string):Promise<DishItem[]> {

        const keyId = dishKey(userId, restId)
        this.logger.info('getDishesByRestaturant', {dishKey: keyId})
        return this.dbAccess.getDishListbyRestaurant(keyId);
    
    }

    async createDishByRestaurant(userId: string, restId: string, newItem:CreateDishRequest):Promise<DishItem> {

        const dishId = uuid.v4();
        const keyId = dishKey(userId, restId)

        const newRest:DishItem = {
            keyId,
            dishId,
            restId,
            dishName: newItem.dishName,
            ingridients: newItem.ingridients,
            price: newItem.price
        }

        this.logger.info('createDishByRestaturant', {newRest});
        return this.dbAccess.createDishbyRestaurant(newRest);
    
    }

    updateDishbyUserRestId(userId: string, restId:string, dishId:string ,newItem:UpdateDishRequest):Promise<DishItem> {

        const keyId = dishKey(userId, restId)
        const newRest:DishItem = {
            keyId,
            dishId,
            restId,
            dishName: newItem.dishName,
            ingridients: newItem.ingridients,
            price: newItem.price
        }

        this.logger.info('updateDish', {newRest});
        return this.dbAccess.updateDish(newRest);
    
    }

    async deleteDishbyUserId(userId: string, restId: string, dishId:string): Promise<boolean> {

        const keyId = dishKey(userId, restId)
        const deleteDish:DishItem = {
            keyId,
            dishId,
            restId,
            dishName: '',
            price: 0
        }

        this.logger.info('deleteDish', {deleteDish});
        return await this.dbAccess.deleteDish(deleteDish);
    }


}

export function dishKey(userId: string, restId: string): string {

    return userId+'|'+restId;

}