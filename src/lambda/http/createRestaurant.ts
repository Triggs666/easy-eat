import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId, returnErrorMsg } from '../utils'
import { CreateRestaurantRequest } from '../../requests/CreateRestaurantRequest'
import { Restaurant } from '../../businessLayer/restaurants'

const logger = createLogger('lambda::CREATE_RESTAURANT')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const newRest: CreateRestaurantRequest = JSON.parse(event.body)
  logger.info('Creating a Restaurant', newRest)
  
  const rests = new Restaurant();
  const item = await rests.createRestaurantbyUserId(getUserId(event), newRest)

  if (item == undefined){
    return returnErrorMsg (500, 'Error creting new restaurant!');
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
