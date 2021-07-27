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

      await this.docClient.query({
          TableName: this.restaurantTable,
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

      return items as RestaurantItem[];
  
  }

  async getAllRestaurants():Promise<RestaurantItem[]> {

    this.logger.info('getAllRestaurants', {tableNAme: this.restaurantTable})

    var items = {};

    await this.docClient.scan({
        TableName: this.restaurantTable
      }).promise()
      .then((data) => {
        this.logger.info("Get process finished OK", {data})
        items = data.Items;
      })
      .catch((err: AWSError) => {
        this.logger.error("Get process ERROR:",err)
      });

    return items as RestaurantItem[];

  }

  async getRestListbyRestId(userId: string, restId: string):Promise<RestaurantItem[]> {

    this.logger.info('getRestListbyUserId', {tableNAme: this.restaurantTable, userId})

    var items = {};

    await this.docClient.query({
        TableName: this.restaurantTable,
        KeyConditionExpression: 'userId = :userId and restId = :restId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':restId': restId
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

    return items as RestaurantItem[];

}

  async createRestaurant(newItem: RestaurantItem):Promise<RestaurantItem> {

    this.logger.info('createRestaurant', {newRestaurant: newItem})

    const params = {
      TableName: this.restaurantTable,
      Item: newItem
    }

    var createdItem: RestaurantItem = undefined;
    await this.docClient.put(params).promise()
    .then((data) => {
      this.logger.info("Create process finished OK", {data})
      createdItem = newItem;
    })
    .catch((err: AWSError) => {
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
      UpdateExpression: "set #N=:name",
      ConditionExpression: 'attribute_exists(restId)',
      ExpressionAttributeValues:{
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
    .catch((err: AWSError) => {
      if (err.code === "ConditionalCheckFailedException"){
        this.logger.error("Restaurant not found to update:",{restId:newItem.restId});
        updatedItem = {} as RestaurantItem;
      }
      else this.logger.error("Update process ERROR:",err)
    });

    return updatedItem;
    
  }

  async updateURLRestLogo(item: RestaurantItem, URL: string):Promise<RestaurantItem> {

    const params = {
      TableName: this.restaurantTable,
      Key:{
        userId: item.userId,
        restId: item.restId
      },
      UpdateExpression: "set logoUrl =:url",
      ExpressionAttributeValues:{
          ":url":URL
      },
      ReturnValues:"UPDATED_NEW"
    }
    
    this.logger.info('updateURLRestLogo', {params})

    var updatedItem: RestaurantItem = undefined;
    await this.docClient.update(params).promise()
    .then((data) => {
      this.logger.info("Update URL process finished OK", {data})
      updatedItem = data as unknown as RestaurantItem;
    })
    .catch((err) => {
      this.logger.error("Update URL process ERROR:",err)
    });

    return updatedItem;
    
  }

}