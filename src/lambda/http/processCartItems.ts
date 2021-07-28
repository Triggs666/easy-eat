import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId, returnErrorMsg } from '../utils'
import { Cart } from '../../businessLayer/cart'

const logger = createLogger('lambda::PROCESS_CART')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const userId = getUserId(event);
    logger.info('Process the order',{userId});

    const cart = new Cart();
    const cartProcessed = await cart.processCartOrder(userId)
    if (!cartProcessed){
        return returnErrorMsg (500, 'Error processing cart order!');
    }

    return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({})
      }

}