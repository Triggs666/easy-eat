import { createLogger } from '../utils/logger'
import { Logger } from 'winston';
import * as uuid from 'uuid'
import { DishItem } from '../models/DishItem';
import { DishDBAccess } from '../dataLayer/dishesAccess';
import { CreateDishRequest } from '../requests/CreateDishRequest';
import { UpdateDishRequest } from '../requests/UpdateDishRequest';
import { CartItem } from '../models/CartItem';
import { Cart } from './cart';
import { DishStorageAccess } from '../storageLayer/dishStorage';


export class Dish{

    private readonly logger:Logger;
    private readonly dbAccess:DishDBAccess;
    private readonly storageAccess:DishStorageAccess 

    constructor(){
        this.logger = createLogger('businessLayer::Dishes');
        this.dbAccess = new DishDBAccess();
        this.storageAccess = new DishStorageAccess();
    }

    async getDishesByRestaturant(userId: string, restId: string):Promise<DishItem[]> {

        const keyId = dishKey(userId, restId)
        this.logger.info('getDishesByRestaturant', {dishKey: keyId})
        return this.dbAccess.getDishListbyRestaurant(keyId);
    
    }

    async getDishById(dishId: string):Promise<DishItem> {

        this.logger.info('getDishesById', {dishId})
        const result:DishItem[] = await this.dbAccess.getDishesById(dishId);
        
        if (result != undefined && result.length>0){
            return result[0];
        }

        return undefined;
    
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

    async putDishInUserCart(userId: string, restId: string, dishId: string, amount: number): Promise<CartItem> {
        
        const dishItem:DishItem = await this.getDishById(dishId);
        
        if (dishItem == undefined) return undefined;

        const cart:Cart = new Cart();
        return await cart.createItemInUserCart (userId, restId, dishId, amount, dishItem.dishName, amount*dishItem.price)
    }

    async getUploadUrl(currentItem:DishItem): Promise<string> {

        const imageId = uuid.v4();
        const signedURL = this.storageAccess.getSignedUploadUrl(imageId);
        const URL = this.storageAccess.getImageUrl(imageId);

        this.logger.info('updateURLDishImage', {currentItem, URL});
        const updatedItem = await this.dbAccess.updateURLDishImage(currentItem, URL);

        if (updatedItem == undefined) return undefined;  //ERROR updating item!!!

        return signedURL;
    }


}

export function dishKey(userId: string, restId: string): string {

    return userId+'|'+restId;

}