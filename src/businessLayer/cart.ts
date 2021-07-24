import { Logger } from "winston";
import { createLogger } from '../utils/logger'
import { CartDBAccess } from "../dataLayer/cartAccess";
import * as uuid from 'uuid'
import { CartItem } from "../models/CartItem";
import { UpdateCartItemRequest } from "../requests/UpdateCartItemRequest";
import { Dish } from "./dishes";
import { DishItem } from "../models/DishItem";
import { Topics } from "./topics";

export class Cart{

    private readonly logger:Logger;
    private readonly dbAccess:CartDBAccess; 

    constructor(){
        this.logger = createLogger('businessLayer');
        this.dbAccess = new CartDBAccess();
    }

    async createItemInUserCart(userId: string, restId: string, dishId: string, amount: number, dishName: string, price: number): Promise<CartItem> {
        
        const itemId = uuid.v4();
        const newItem:CartItem = {
            userId,
            itemId,
            restId,
            dishId,
            dishName,
            amount,
            price
        }

        this.logger.info('createDishInUserCart', {newItem});
        return await this.dbAccess.createCartItemsByUser(newItem);
    }

    async updateItemInUserCart(userId:string, itemId: string, itemData: UpdateCartItemRequest): Promise<CartItem> {
        
        this.logger.info('Getting carItem full info', {userId, itemId});
        const cartItems:CartItem[] = await this.dbAccess.getCartItemsById(userId, itemId);
        if (cartItems == undefined || cartItems.length==0){
            return undefined;
        }

        const cartItem = cartItems[0];

        const dish:Dish = new Dish();
        const dishItem: DishItem = await dish.getDishById(cartItem.dishId)

        cartItem.amount = itemData.amount;
        cartItem.price = dishItem.price * itemData.amount;

        this.logger.info('updateItemInUserCart', {cartItem});
        return await this.dbAccess.updateCartItem(cartItem);
    }

    async getCartItemsbyUserId(userId: string): Promise<CartItem[]> {

        this.logger.info('getCartItemsByUserId', {userId})
        return this.dbAccess.getCartItemsByUser(userId);

    }

    async deleteItemInUserCart(userId: string, itemId: string): Promise<boolean> {
        
        const deleteItem:CartItem = {
            userId,
            itemId,
            restId: '',
            dishId: '',
            dishName: '',
            amount: 0,
            price: 0,
        }

        this.logger.info('deleteCartItem', {deleteItem});
        return await this.dbAccess.deleteCartItem(deleteItem);
    }

    async processCartOrder(userId: string): Promise<boolean> {

        this.logger.info('Process user order', {userId})

        const topic:Topics = new Topics();
        const items:CartItem[] = await this.dbAccess.getCartItemsByUser(userId);

    
        for (var i=0; i<items.length; i++){
            const item:CartItem = items[i];
            this.logger.info('Notify item order', {item});

            const topicARN = await topic.getTopicARNByRestId(item.restId);
            const result = topic.notifyOrder(topicARN, item);

        }

        this.logger.info('Notify', {userId})


        

    }

}