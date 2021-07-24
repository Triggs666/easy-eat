import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { createLogger } from '../utils/logger'

import { Logger } from 'winston';
import { AWSError } from 'aws-sdk';
import { CartItem } from '../models/CartItem';

export class CartDBAccess{
    
  private readonly docClient:DocumentClient;
  private readonly logger:Logger;
  private readonly cartTable = process.env.CART_TABLE;

  constructor(){
      this.docClient = new AWS.DynamoDB.DocumentClient();
      this.logger = createLogger('dataLayer::CartAccess');
  }

  async getCartItemsByUser(userId:string):Promise<CartItem[]> {

      this.logger.info('GetCartItemsByUser', {tableName: this.cartTable, userId})
  
      var items = {};

      const result = await this.docClient.query({
        TableName: this.cartTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      }).promise()
      .then((data) => {
        this.logger.info("Get process finished OK", {data})
        items = data.Items;
      })
      .catch((err: AWSError) => {
        this.logger.error("Get process ERROR:",err)
      });

      return items as CartItem[];
  
  }

  async getCartItemsById(itemId:string):Promise<CartItem[]> {

    this.logger.info('GetCartItemsById', {tableName: this.cartTable, itemId})

    var items = {};

    const result = await this.docClient.query({
      TableName: this.cartTable,
      KeyConditionExpression: 'itemId = :itemId',
      ExpressionAttributeValues: {
        ':itemId': itemId
      },
      ScanIndexForward: false
    }).promise()
    .then((data) => {
      this.logger.info("Get process finished OK", {data})
      items = data.Items;
    })
    .catch((err: AWSError) => {
      this.logger.error("Get process ERROR:",err)
    });

    return items as CartItem[];

}


  async createCartItemsByUser(newItem: CartItem):Promise<CartItem> {

    this.logger.info('createCartItemsByUser', newItem)

    const params = {
      TableName: this.cartTable,
      Item: newItem
    }

    var createdItem: CartItem = undefined;
    await this.docClient.put(params).promise()
    .then((data) => {
      this.logger.info("Create process finished OK", {data})
      createdItem = newItem;
    })
    .catch((err: AWSError) => {
      this.logger.error("Create process ERROR:",err);
    });

    return createdItem;
  }

  async deleteCartItem(item: CartItem) : Promise<boolean>{

    var params = {
      TableName:this.cartTable,
      Key:{
        keyId: item.itemId
      },
      ReturnValues:"ALL_OLD"
    }
    this.logger.info('deleteCartITem', {params});

    var deleteOK : boolean = false;
    await this.docClient.delete(params).promise()
    .then((data) => {
      this.logger.info("Deleting process finished OK", {data})
      deleteOK=true;
    })
    .catch((err: AWSError) => {
      this.logger.error("Deleting process ERROR",err)
    });

    return deleteOK;
  }

  
  async updateCartItem(newItem: CartItem):Promise<CartItem> {

    const params = {
      TableName: this.cartTable,
      Key:{
        keyId: newItem.itemId
      },
      UpdateExpression: "set amount= :amount, price = :price",
      ConditionExpression: 'attribute_exists(itemId)',
      ExpressionAttributeValues:{
          ":amount":newItem.amount,
          ":price":newItem.price
      },
      ReturnValues:"UPDATED_NEW"
    }
    
    this.logger.info('updateCartItem', {params})

    var updatedItem: CartItem = undefined;
    await this.docClient.update(params).promise()
    .then((data) => {
      this.logger.info("Update process finished OK", {data})
      updatedItem = data.Attributes as unknown as CartItem;
    })
    .catch((err: AWSError) => {
      if (err.code === "ConditionalCheckFailedException"){
        this.logger.error("Dish not found to update:",{dishID:newItem.dishId});
        updatedItem = {} as CartItem;
      }
      else this.logger.error("Update process ERROR:",err)
    });

    return updatedItem;
    
  }

}