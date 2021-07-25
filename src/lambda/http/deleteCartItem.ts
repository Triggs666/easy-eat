import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId, returnErrorMsg } from '../utils'
import { Cart } from '../../businessLayer/cart'

const logger = createLogger('lambda::DELETE_CART_ITEM')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const cartId = event.pathParameters.cartId

  logger.info('Deleting the cartItem', cartId)

  const cart = new Cart();
  const deletedItem = await cart.deleteItemInUserCart(getUserId(event), cartId)
  if (!deletedItem){
    return returnErrorMsg (500, 'Error deleting cart item!');
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
