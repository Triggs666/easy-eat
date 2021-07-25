import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId, returnErrorMsg } from '../utils'
import { CreateDishRequest } from '../../requests/CreateDishRequest'
import { Dish } from '../../businessLayer/dishes'

const logger = createLogger('lambda::CREATE_DISH')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const newDish: CreateDishRequest = JSON.parse(event.body)
  const restId = event.pathParameters.restId;
  logger.info('Creating a new dish', {restId, newDish});
  
  const dishes = new Dish();
  const item = await dishes.createDishByRestaurant(getUserId(event),restId,newDish);

  if (item == undefined){
    return returnErrorMsg (500, 'Error creting new dish!');
  }

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }
}
