import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId, returnErrorMsg } from '../utils'
import { Dish } from '../../businessLayer/dishes'

const logger = createLogger('lambda::DELETE_DISH')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const dishId = event.pathParameters.dishId
  const restId = event.pathParameters.restId;
  logger.info('Deleting the dish', {dishId,restId});

  const dish = new Dish();
  const deletedItem = await dish.deleteDishbyUserId(getUserId(event),restId,dishId);
  
  if (!deletedItem){
    return returnErrorMsg (500, 'Error deleting dish');
  }
  
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }

}
