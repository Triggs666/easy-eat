import {Router, Request, Response} from 'express';
import { DishRouter } from './test/dish.router';
import {RestaurantRouter} from './test/rest.router';

const router: Router = Router();

router.use('/rest', RestaurantRouter);
router.use('/rest/:idRest/dish', DishRouter);

router.get('/', async (req: Request, res: Response) => {
  res.send(`V0`);
});

export const IndexRouter: Router = router;
