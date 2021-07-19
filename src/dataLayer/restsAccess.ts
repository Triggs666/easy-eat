import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { RestaurantItem } from '../models/RestaurantItem';
import { createLogger } from '../utils/logger'

import { Logger } from 'winston';
import { AWSError } from 'aws-sdk';

export class RestaurantDBAccess{
    
  private readonly docClient:DocumentClient;
  private readonly logger:Logger;
  private readonly restaurantTable = process.env.RESTAURANT_TABLE;

  constructor(){
      this.docClient = new AWS.DynamoDB.DocumentClient();
      this.logger = createLogger('dataLayer::RestaurantAccess');
  }

  async getRestListbyUserId(userId: string):Promise<RestaurantItem[]> {

      this.logger.info('getRestListbyUserId', {tableNAme: this.restaurantTable, userId})
  
      var items = {};

      const result = await this.docClient.query({
          TableName: this.restaurantTable,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
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

      return items as RestaurantItem[];
  
  }

  async createRestaurant(newItem: RestaurantItem):Promise<RestaurantItem> {

    this.logger.info('createRestaurant', {newRestaurant: newItem})

    const params = {
      TableName: this.restaurantTable,
      Item: newItem,
      ReturnValues:"ALL_OLD"
    }

    var createdItem: RestaurantItem = undefined;
    await this.docClient.put(params).promise()
    .then((data) => {
      this.logger.info("Create process finished OK", {data})
      createdItem = data as unknown as RestaurantItem;
    })
    .catch((err) => {
      this.logger.error("Create process ERROR:",err)
    });

    return createdItem;
  }

  async deleteRestaurant(item: RestaurantItem) : Promise<boolean>{

    var params = {
      TableName:this.restaurantTable,
      Key:{
        userId: item.userId,
        restId: item.restId
      },
      ReturnValues:"ALL_OLD"
    }
    this.logger.info('deleteRestaurant', {params});

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

  async updateRestaurant(newItem: RestaurantItem):Promise<RestaurantItem> {

    const params = {
      TableName: this.restaurantTable,
      Key:{
        userId: newItem.userId,
        restId: newItem.restId
      },
      UpdateExpression: "set email =:email, #N=:name",
      ExpressionAttributeValues:{
          ":email":newItem.email,
          ":name":newItem.name,
      },
      ExpressionAttributeNames:{
        "#N": "name"
      },
      ReturnValues:"UPDATED_NEW"
    }
    
    this.logger.info('updateRestaurant', {params})

    var updatedItem: RestaurantItem = undefined;
    await this.docClient.update(params).promise()
    .then((data) => {
      this.logger.info("Update process finished OK", {data})
      updatedItem = data.Attributes as unknown as RestaurantItem;
    })
    .catch((err) => {
      this.logger.error("Update process ERROR:",err)
    });

    return updatedItem;
    
  }

}