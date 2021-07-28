import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getUserId, returnErrorMsg } from '../utils'
import { UpdateRestaurantRequest } from '../../requests/UpdateRestaurantRequest'
import { Restaurant } from '../../businessLayer/restaurants'

const logger = createLogger('lambda::UPDATE_RESTAURANT')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const restId = event.pathParameters.restId
  const updatedRest: UpdateRestaurantRequest = JSON.parse(event.body)
  logger.info('Updating a restaurant', {restId, updatedRest})
  
  const rests = new Restaurant();
  const savedItem = await rests.updateRestaurantbyUserRestId(getUserId(event), restId, updatedRest)

  // return error codes 
  if (savedItem == undefined){
    return returnErrorMsg (500, 'Error Updating restaurant!');
  } else {
    if (savedItem.name == undefined){
      return returnErrorMsg (400, 'Restaurant not found!');
    } 
  }

  // return update result 
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
