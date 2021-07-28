import 'source-map-support/register'

import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { Dish } from '../../businessLayer/dishes'
import { APIGatewayProxyEvent } from 'aws-lambda'



const logger = createLogger('lambda::GET_ALL_DISHES')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const restId = event.pathParameters.restId;
  
  logger.info('Getting all dishes for restaurant', restId);

  const dish = new Dish();
  const items = await dish.getAllDishesByRestaturant(restId)

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
