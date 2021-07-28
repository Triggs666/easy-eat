import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { returnErrorMsg } from '../utils'
import { Dish } from '../../businessLayer/dishes'

const logger = createLogger('lambda::UPLOAD_URL_DISH_PHOTO');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const dishId = event.pathParameters.dishId
  logger.info('Generating UploadUrl for dish photo', {dishId})
  
  const dishes = new Dish();
  const dishItem = await dishes.getDishById(dishId);

  if (dishItem == undefined){
    return returnErrorMsg (400, 'dish does not exist');
  }

  const uploadUrl = await dishes.getUploadUrl(dishItem)
  if (uploadUrl == undefined){
    return returnErrorMsg (500, 'Server error generating URL');
  }

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
  
}
