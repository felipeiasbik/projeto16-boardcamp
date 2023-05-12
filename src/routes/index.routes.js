import { Router } from 'express';
import gamesRouter from "../routes/games.routes.js";
import customersRouter from "../routes/customers.routes.js";
import rentalsRouter from './rentals.routes.js';

const router = Router();
router.use(gamesRouter);
router.use(customersRouter);
router.use(rentalsRouter);

export default router;