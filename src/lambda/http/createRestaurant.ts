import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { CreateRestaurantRequest } from '../../requests/CreateRestaurantRequest'
import { Restaurant } from '../../businessLayer/restaurants'

const logger = createLogger('lambda::CREATE_RESTAURANT')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const newRest: CreateRestaurantRequest = JSON.parse(event.body)
  logger.info('Creating a Restaurant', newRest)
  
  const todos = new Restaurant();
  const item = await todos.createRestaurantbyUserId(getUserId(event), newRest)

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
