import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { createLogger } from '../utils/logger'

import { Logger } from 'winston';
import { AWSError } from 'aws-sdk';
import { DishItem } from '../models/DishItem';

export class DishDBAccess{
    
  private readonly docClient:DocumentClient;
  private readonly logger:Logger;
  private readonly dishTable = process.env.DISH_TABLE;

  constructor(){
      this.docClient = new AWS.DynamoDB.DocumentClient();
      this.logger = createLogger('dataLayer::RestaurantAccess');
  }

  async getDishListbyRestaurant(keyId:string):Promise<DishItem[]> {

      this.logger.info('getDishesByRestaturant', {tableName: this.dishTable, keyId})
  
      var items = {};

      const result = await this.docClient.query({
          TableName: this.dishTable,
          KeyConditionExpression: 'keyId = :keyId',
          ExpressionAttributeValues: {
            ':keyId': keyId
          },
          ScanIndexForward: false
        }).promise()
        .then((data) => {
          this.logger.info("get process finished OK", {data})
          items = data.Items;
        })
        .catch((err) => {
          this.logger.error("Create process ERROR:",err)
        });

      return items as DishItem[];
  
  }

  async createDishbyRestaurant(newItem: DishItem):Promise<DishItem> {

    this.logger.info('createDishbyRestaurant', {newDish: newItem})

    const params = {
      TableName: this.dishTable,
      Item: newItem
    }

    var createdItem: DishItem = undefined;
    await this.docClient.put(params).promise()
    .then((data) => {
      this.logger.info("Create process finished OK", {data})
      createdItem = newItem;
    })
    .catch((err) => {
      this.logger.error("Create process ERROR:",err);
    });

    return createdItem;
  }

  async deleteDish(item: DishItem) : Promise<boolean>{

    var params = {
      TableName:this.dishTable,
      Key:{
        keyId: item.keyId,
        dishId: item.dishId
      },
      ReturnValues:"ALL_OLD"
    }
    this.logger.info('deleteDish', {params});

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

  async updateDish(newItem: DishItem):Promise<DishItem> {

    const params = {
      TableName: this.dishTable,
      Key:{
        keyId: newItem.keyId,
        dishId: newItem.dishId
      },
      UpdateExpression: "set dishName = :dishName, ingridients = :ingridients, price = :price",
      ConditionExpression: 'attribute_exists(dishId)',
      ExpressionAttributeValues:{
          ":dishName":newItem.dishName,
          ":ingridients":newItem.ingridients,
          ":price":newItem.price
      },
      ReturnValues:"UPDATED_NEW"
    }
    
    this.logger.info('updateDish', {params})

    var updatedItem: DishItem = undefined;
    await this.docClient.update(params).promise()
    .then((data) => {
      this.logger.info("Update process finished OK", {data})
      updatedItem = data.Attributes as unknown as DishItem;
    })
    .catch((err) => {
      this.logger.error("Update process ERROR:",err)
    });

    return updatedItem;
    
  }

}