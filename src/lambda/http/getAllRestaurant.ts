import 'source-map-support/register'

import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { Restaurant } from '../../businessLayer/restaurants'



const logger = createLogger('lambda::GET_ALL_RESTAURANTS')

export const handler: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  
  logger.info('Getting all restaurants')
  
  const rests = new Restaurant();
  const items = await rests.getAllRestaurants()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }

}
