import { Router } from 'express';
import gamesRouter from "../routes/games.routes.js";
import customersRouter from "../routes/customers.routes.js";

const router = Router();
router.use(gamesRouter);
router.use(customersRouter);

export default router;