import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { Restaurant } from '../../businessLayer/restaurants'
import { getUserId, returnErrorMsg } from '../utils'

const logger = createLogger('lambda::UPLOAD_URL_RESTAURANT_LOGO');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const restId = event.pathParameters.restId
  logger.info('Generating UploadUrl for restaurant logo', {restId})
  
  const rests = new Restaurant();
  const restItem = await rests.getRestaurantbyRestId(getUserId(event),restId)

  if (restItem == undefined){
    return returnErrorMsg (400, 'restaurant does not exist');
  }

  const uploadUrl = await rests.getUploadUrl(restItem)
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
