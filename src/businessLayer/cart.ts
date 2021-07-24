import { Logger } from "winston";
import { createLogger } from '../utils/logger'
import { CartDBAccess } from "../dataLayer/cartAccess";
import * as uuid from 'uuid'
import { CartItem } from "../models/CartItem";
import { UpdateCartItemRequest } from "../requests/UpdateCartItemRequest";
import { Dish } from "./dishes";
import { DishItem } from "../models/DishItem";

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

    async updateItemInUserCart(itemId: string, itemData: UpdateCartItemRequest): Promise<CartItem> {
        
        const cartItems:CartItem[] = await this.dbAccess.getCartItemsById(itemId);
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

    async deleteItemInUserCart(itemId: string): Promise<boolean> {
        
        const deleteItem:CartItem = {
            userId: '',
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

}