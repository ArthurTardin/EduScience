import { Router } from 'express';
import { criarPedido } from '../controllers/pedidoController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', autenticarToken, criarPedido);

export default router;