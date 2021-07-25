import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId, returnErrorMsg } from '../utils'
import { Dish } from '../../businessLayer/dishes'

const logger = createLogger('lambda::ADD_DISH_TO_CART')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const amount = event.pathParameters.amount;
  const idRest = event.pathParameters.idRest;
  const idDish = event.pathParameters.idDish;
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

  logger.info('Add the dish to the user cart', {idRest, idDish, nAmount})

  const dish = new Dish();
  const cartItem = await dish.putDishInUserCart(getUserId(event),idRest,idDish,nAmount);
  if (!cartItem){
    return returnErrorMsg (500, 'Error adding dish to cart!');
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
