import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId, returnErrorMsg } from '../utils'
import { Restaurant } from '../../businessLayer/restaurants'

const logger = createLogger('lambda::DELETE_RESTAURANT')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const restId = event.pathParameters.restId
  logger.info('Deleting a restaurant', restId)

  const rest = new Restaurant();
  const deletedItem = await rest.deleteRestaurantbyUserId(getUserId(event),restId)
  
  if (!deletedItem){
    return returnErrorMsg (500, 'Error Deleting restaurant!');
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
