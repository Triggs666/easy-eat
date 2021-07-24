import {Router, Request, Response} from 'express';
import * as AWS  from 'aws-sdk'
import { createLogger } from '../../../utils/logger'
import { Cart } from '../../../businessLayer/cart';
import { UpdateCartItemRequest } from '../../../requests/UpdateCartItemRequest';


const logger = createLogger('cart-router')

const router: Router = Router();

const docClient = new AWS.DynamoDB.DocumentClient()
const userId = 'auth0|60e0d2229fc0f400699888cd';

// Get all cart items by user
router.get('/', async (req: Request, res: Response) => {
  logger.info('Getting all cart items')
  
  const cart = new Cart();
  const items = await cart.getCartItemsbyUserId(userId)
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
  res.send(items);
});

router.patch('/:id', async (req: Request, res: Response) => {
  logger.info('Updating a Item ...')
  const {id} = req.params;
  const {amount} = req.query;

  const nAmount = Number(amount);
  var newItem: UpdateCartItemRequest = {amount: nAmount};

  logger.info('Updating a Item', {newItem});

  const cart = new Cart();
  const savedItem = await cart.updateItemInUserCart(userId, id, newItem)
  if (savedItem == undefined){
    res.status(500).send('Error Updating');
  } else {
    logger.info('Updated Item', savedItem)
    if (savedItem.amount == undefined){
      res.status(400).send('Nothing Updated!');
    } else {
      res.status(201).send(savedItem);
    }
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  
  const {id} = req.params;

  logger.info('Deleting the cartItem', id)

  const cart = new Cart();
  const deletedItem = await cart.deleteItemInUserCart(userId, id)
  if (!deletedItem){
    res.status(500).send('Error deleting restaurant');
  } else {
    res.status(204).send({});
  }
});


export const CartRouter: Router = router;
