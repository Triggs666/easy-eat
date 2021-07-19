import {Router, Request, Response} from 'express';
import * as AWS  from 'aws-sdk'
import { createLogger } from '../../../utils/logger'
import { Dish } from '../../../businessLayer/dishes';
import { CreateDishRequest } from '../../../requests/CreateDishRequest';


const logger = createLogger('dish-router')

const router: Router = Router({mergeParams: true});

const docClient = new AWS.DynamoDB.DocumentClient()
const restaurantTable = process.env.DISH_TABLE
const userId = 'auth0|60e0d2229fc0f400699888cd';

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
  const {idRest} = req.params
  logger.info('Getting all dishes',{idRest});
  
  const dish = new Dish();
  const items = await dish.getDishesByRestaturant(userId,idRest)
/*
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
  */
  res.status(200).send('OK');
});

// Get a feed resource
/*
router.get('/:id', async (req: Request, res: Response) => {
  const {id} = req.params
  logger.info('Deleting a TODO', id)

  const rest = new Restaurant();
  await rest.deleteRestaurantbyUserId(userId, id)

  res.send({});
});
*/

router.post('/', async (req: Request, res: Response) => {
  
  const {idRest} = req.params
  const dishName = req.body.dishName;
  const ingridients = req.body.ingridients;
  const price = req.body.price;
  price

  const newDish: CreateDishRequest = {
    dishName,
    ingridients,
    price
  }
  logger.info('Creating a DISH', newDish)
  
  const rest = new Dish();
  const savedItem = await rest.createDishByRestaturant(userId, idRest, newDish)
  if (savedItem == undefined) res.status(400).send('Error creating new dish');
  else res.status(201).send(savedItem);
});

router.patch('/:id', async (req: Request, res: Response) => {
  logger.info('Updating a RESTAURANT ...')
  const {id} = req.params;
  const name = req.body.name;
  const email = req.body.email;

  var newItem: UpdateRestaurantRequest = {
    name: name,
    email: email
  }

  logger.info('Updating a Restaurant', newItem)

  const rest = new Restaurant();
  const savedItem = await rest.updateRestaurantbyUserRestId(userId,id,newItem)
  if (savedItem == undefined){
    res.status(500).send('Error Updating');
  } else {
    logger.info('Updated Restaurant', savedItem)
    if (savedItem.name == undefined){
      res.status(400).send('Nothing Updated!');
    } else {
      res.status(201).send(savedItem);
    }
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  
  const {id} = req.params;

  logger.info('Deleting the restaurant', id)

  const rest = new Restaurant();
  const deletedItem = await rest.deleteRestaurantbyUserId(userId,id)
  if (!deletedItem){
    res.status(500).send('Error deleting restaurant');
  } else {
    res.status(204).send({});
  }
});


export const DishRouter: Router = router;
