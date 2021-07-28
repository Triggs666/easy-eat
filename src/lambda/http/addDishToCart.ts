import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId, returnErrorMsg } from '../utils'
import { Dish } from '../../businessLayer/dishes'

const logger = createLogger('lambda::ADD_DISH_TO_CART')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const amount = event.queryStringParameters.amount;
  const restId = event.pathParameters.restId;
  const dishId = event.pathParameters.dishId;
  var nAmount = 0;
  
  if (!amount) {
    return returnErrorMsg (300, 'amount value is mandatory');
  }

  nAmount = Number(amount);
  if (Number.isNaN(nAmount)){
    return returnErrorMsg (300, 'amount value should be a number');
  }
  if (nAmount<=0){
    return returnErrorMsg (300, 'amount value should be greater than 0');
  }

  logger.info('Add the dish to the user cart', {restId, dishId, nAmount})

  const dish = new Dish();
  const cartItem = await dish.putDishInUserCart(getUserId(event), restId, dishId, nAmount);
  
  if (cartItem == undefined){
    return returnErrorMsg (500, 'Error adding dish to cart!');
  }
  if (cartItem.itemId == undefined){
    return returnErrorMsg (400, 'Impossible to add dish to cart. Dish or Restaurant not found!');
  }

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      cartItem
    })
  }
}
