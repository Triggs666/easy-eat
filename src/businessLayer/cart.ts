import { Logger } from "winston";
import { createLogger } from '../utils/logger'
import { CartDBAccess } from "../dataLayer/cartAccess";
import * as uuid from 'uuid'
import { CartItem } from "../models/CartItem";
import { UpdateCartItemRequest } from "../requests/UpdateCartItemRequest";
import { Dish } from "./dishes";
import { DishItem } from "../models/DishItem";
import { Topics } from "./topics";
import { Restaurant } from "./restaurants";
import { RestaurantItem } from "../models/RestaurantItem";

export class Cart{

    private readonly logger:Logger;
    private readonly dbAccess:CartDBAccess; 

    constructor(){
        this.logger = createLogger('businessLayer::CART');
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
        
        // Get cart item full data ...

        const cartItem:CartItem = await this.getCartItemById(userId, itemId);
        this.logger.info('Got cart item', {cartItem});
        if (cartItem == undefined) return {
            userId: undefined,
            itemId: undefined,
            restId: undefined,
            dishId: undefined,
            dishName: undefined,
            amount: undefined,
            price: undefined
        };

        // Get dish price data ...

        const dish:Dish = new Dish();
        const dishItem: DishItem = await dish.getDishById(cartItem.dishId)
        this.logger.info('Got related dish', {dishItem});

        // Recalculate final price ...

        cartItem.amount = itemData.amount;
        cartItem.price = dishItem.price * itemData.amount;

        // update cart item ...

        this.logger.info('updateItemInUserCart', {cartItem});
        return await this.dbAccess.updateCartItem(cartItem);
    }

    async getCartItemsbyUserId(userId: string): Promise<CartItem[]> {

        this.logger.info('getCartItemsByUserId', {userId})
        return this.dbAccess.getCartItemsByUser(userId);

    }

    async getCartItemById(userId: string, itemId: string): Promise<CartItem> {

        this.logger.info('getCartItemById', {userId, itemId});
        const cartItems:CartItem[] = await this.dbAccess.getCartItemsById(userId, itemId);
        if (cartItems == undefined || cartItems.length==0){
            return undefined;
        }

        return cartItems[0];

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

        // Get full info from cart item list ...

        const items:CartItem[] = await this.dbAccess.getCartItemsByUser(userId);
        this.logger.info('Elements in CART', {imetsLength: items.length});

        var error = false;
        const topic:Topics = new Topics();

        //Notify the order to restaurants ...

        for (var i=0; i<items.length && !error; i++){

            const item:CartItem = items[i];
            this.logger.info('Notify item order', {item});

            //Get the topic ARN to notify de order ...

            const restaurants: Restaurant = new Restaurant();
            const restItem:RestaurantItem = await restaurants.getRestaurantbyId(item.restId);
            if (restItem == undefined){
                this.logger.error('Restaurant not found', {userId, item});
                error = true;
            }
            else{
                const topicARN = restItem.topicARN;
                this.logger.info('Notify item order to topic', {topicARN, item});
                error = (await topic.notifyOrder(topicARN, item) == undefined);
            }

        }
        
        if (error) return false;

        //Delete items from user cart ...

        for (var i=0; i<items.length && !error; i++){

            const item:CartItem = items[i]; 
            this.logger.info('Delete item order', {item});
            error = !(await this.dbAccess.deleteCartItem(item));
            
        }

        return !error;

    }

}