import {Router, Request, Response} from 'express';
//import * as AWS  from 'aws-sdk'
import { createLogger } from '../../../utils/logger'
import { Dish } from '../../../businessLayer/dishes';


const logger = createLogger('attach-router')

const router: Router = Router();

//const userId = 'auth0|60e0d2229fc0f400699888cd';

router.post('/', async (req: Request, res: Response) => {

  logger.info('Process the order');
  const {dishId} = req.params;
  const dishes:Dish = new Dish()

  const current_dish = await dishes.getDishById(dishId);
  logger.info('Got dish ', {current_dish});

  if (current_dish==undefined) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  const uploadUrl = await dishes.getUploadUrl(current_dish)

  if (uploadUrl == undefined){
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({error:'Server error generating URL'})
    }
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

});


export const AttachRouter: Router = router;

