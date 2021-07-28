import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { Dish } from '../../businessLayer/dishes'


const logger = createLogger('lambda::GET_DISHES')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const restId = event.pathParameters.restId;
  
  logger.info('Getting all dishes for restaurant', restId);

  const dish = new Dish();
  const items = await dish.getDishesByRestaturant(getUserId(event),restId)

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
