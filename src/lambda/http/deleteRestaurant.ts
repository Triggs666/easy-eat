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
  const errorCode = await rest.deleteRestaurantbyUserId(getUserId(event),restId)
  
  if (errorCode == -2){
    return returnErrorMsg (500, 'Error Deleting restaurant!');
  } else{
    if (errorCode == -1){
      return returnErrorMsg (400, 'Restaurant NOT FOUND!');
    }
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
