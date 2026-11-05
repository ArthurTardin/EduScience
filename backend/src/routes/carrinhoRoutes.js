import express from 'express';
import { 
    listarItens, 
    adicionarItem, 
    atualizarQuantidade, 
    removerItem 
} from '../controllers/carrinhoController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(autenticarToken);

router.get('/:idCliente', listarItens);
router.post('/adicionar', adicionarItem);
router.put('/atualizar/:idCarrinho', atualizarQuantidade);
router.delete('/remover/:idCarrinho', removerItem);

export default router;