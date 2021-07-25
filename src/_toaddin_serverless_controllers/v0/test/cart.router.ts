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

router.patch('/:cartId', async (req: Request, res: Response) => {
  logger.info('Updating a Item ...')
  const {cartId} = req.params;
  const {amount} = req.query;

  const nAmount = Number(amount);
  var newItem: UpdateCartItemRequest = {amount: nAmount};

  logger.info('Updating a Item', {newItem});

  const cart = new Cart();
  const savedItem = await cart.updateItemInUserCart(userId, cartId, newItem)
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

router.delete('/:cartId', async (req: Request, res: Response) => {
  
  const {cartId} = req.params;

  logger.info('Deleting the cartItem', cartId)

  const cart = new Cart();
  const deletedItem = await cart.deleteItemInUserCart(userId, cartId)
  if (!deletedItem){
    res.status(500).send('Error deleting restaurant');
  } else {
    res.status(204).send({});
  }
});

router.post('/', async (req: Request, res: Response) => {

  logger.info('Process the order');

  const cart = new Cart();
  const cartProcessed = await cart.processCartOrder(userId)
  if (!cartProcessed){
    res.status(500).send('Error processing cart');
  } else {
    res.status(200).send('The order has been processed');
  }
});


export const CartRouter: Router = router;
