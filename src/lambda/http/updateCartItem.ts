import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getUserId, returnErrorMsg } from '../utils'
import { Cart } from '../../businessLayer/cart'
import { UpdateCartItemRequest } from '../../requests/UpdateCartItemRequest'

const logger = createLogger('lambda::UPDATE_CART_ITEM')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const cartId = event.pathParameters.cartId;
  const amount = event.pathParameters.amount;

  var nAmount = 0;
  
  if (!amount) {
    return returnErrorMsg (300, 'amount value is mandatory');
  }
  else{
    try{
      nAmount = Number(amount);
    }
    catch(err){
      return returnErrorMsg (300, 'amount value should be a number');
    }
  }
  var newItem: UpdateCartItemRequest = {amount: nAmount};
  logger.info('Updating a Item', {newItem});

  const cart = new Cart();
  const savedItem = await cart.updateItemInUserCart(getUserId(event), cartId, newItem);
  
  if (savedItem == undefined){
    return returnErrorMsg (500, 'Error updating cart item!');
  } else {
    logger.info('Updated Item', savedItem)
    if (savedItem.amount == undefined){
      return returnErrorMsg (400, 'Cart item does not exist!');
    }
  }  

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
