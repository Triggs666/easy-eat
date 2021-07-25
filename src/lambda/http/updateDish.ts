import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getUserId, returnErrorMsg } from '../utils'
import { UpdateDishRequest } from '../../requests/UpdateDishRequest'
import { Dish } from '../../businessLayer/dishes'

const logger = createLogger('lambda::UPDATE_DISH')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
 
  const dishId = event.pathParameters.dishId;
  const restId = event.pathParameters.restId;
  const updatedDish: UpdateDishRequest = JSON.parse(event.body)
  logger.info('Updating dish', {dishId, restId, updatedDish})

  const dish = new Dish();
  const savedItem = await dish.updateDishbyUserRestId(getUserId(event), restId, dishId, updatedDish);

  if (savedItem == undefined){
    return returnErrorMsg (500, 'Error creting new dish!');
  } else {
    logger.info('Updated Dish', savedItem)
    if (savedItem.dishName == undefined){
      return returnErrorMsg (400, 'Dish does not exist!');
    }
  }

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      savedItem
    })
  }
}
