import express from 'express';
import { processarCheckout } from '../controllers/checkoutController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(autenticarToken);
router.post('/finalizar', processarCheckout);

export default router;