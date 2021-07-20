import {Router, Request, Response} from 'express';
import * as AWS  from 'aws-sdk'
import { createLogger } from '../../../utils/logger'
import { Dish } from '../../../businessLayer/dishes';
import { CreateDishRequest } from '../../../requests/CreateDishRequest';
import { UpdateDishRequest } from '../../../requests/UpdateDishRequest';


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
  res.status(200).send(items);
});


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
  
  const dish = new Dish();
  const savedItem = await dish.createDishByRestaurant(userId, idRest, newDish)
  if (savedItem == undefined) res.status(400).send('Error creating new dish');
  else res.status(201).send(savedItem);
});

router.patch('/:idDish', async (req: Request, res: Response) => {
  logger.info('Updating a DISH ...')
  const {idDish} = req.params;
  const {idRest} = req.params;
  const ingridients = req.body.ingridients;
  const dishName = req.body.dishName;
  const price = req.body.price;

  var newItem: UpdateDishRequest = {
    dishName,
    ingridients,
    price
  }

  logger.info('Updating a Dish', newItem)

  const dish = new Dish();
  const savedItem = await dish.updateDishbyUserRestId(userId, idRest, idDish, newItem)
  if (savedItem == undefined){
    res.status(500).send('Error Updating');
  } else {
    logger.info('Updated Dish', savedItem)
    if (savedItem.dishName == undefined){
      res.status(400).send('Nothing Updated!');
    } else {
      res.status(201).send(savedItem);
    }
  }
});

router.delete('/:idDish', async (req: Request, res: Response) => {
  
  const {idDish} = req.params;
  const {idRest} = req.params;

  logger.info('Deleting the dish', idDish)

  const dish = new Dish();
  const deletedItem = await dish.deleteDishbyUserId(userId,idRest,idDish);
  if (!deletedItem){
    res.status(500).send('Error deleting restaurant');
  } else {
    res.status(204).send({});
  }
});


export const DishRouter: Router = router;
