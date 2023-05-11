import { Router } from 'express';
import gamesRouter from "../routes/games.routes.js";

const router = Router();
router.use(gamesRouter)

export default router;