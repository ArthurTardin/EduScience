import { Router } from 'express';
import { criarPedido, obterNotaFiscalPedido } from '../controllers/pedidoController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', autenticarToken, criarPedido);
router.get('/:id/nota-fiscal', autenticarToken, obterNotaFiscalPedido);

export default router;