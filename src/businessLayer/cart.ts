import { Logger } from "winston";
import { createLogger } from '../utils/logger'
import { CartDBAccess } from "../dataLayer/cartAccess";
import * as uuid from 'uuid'
import { CartItem } from "../models/CartItem";

export class Cart{

    private readonly logger:Logger;
    private readonly dbAccess:CartDBAccess; 

    constructor(){
        this.logger = createLogger('businessLayer');
        this.dbAccess = new CartDBAccess();
    }

    async createDishInUserCart(userId: string, restId: string, dishId: string, people: number, dishName: string, price: number): Promise<CartItem> {
        
        const itemId = uuid.v4();
        const newItem:CartItem = {
            userId,
            itemId,
            restId,
            dishId,
            dishName,
            people,
            price
        }

        this.logger.info('createDishInUserCart', {newItem});
        return await this.dbAccess.createCartItemsByUser(newItem);
    }

}