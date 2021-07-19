import {Router, Request, Response} from 'express';
import {RestaurantRouter} from './test/rest.router';

const router: Router = Router();

router.use('/rest', RestaurantRouter);

router.get('/', async (req: Request, res: Response) => {
  res.send(`V0`);
});

export const IndexRouter: Router = router;
