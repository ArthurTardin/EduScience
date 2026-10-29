import { Router } from 'express';
import * as carrinhoController from '../controllers/carrinhoController.js';

router = Router();

router.get('/:idCliente', carrinhoController.listarItens);
router.post('/', carrinhoController.adicionarItem);
router.put('/:idCarrinho', carrinhoController.atualizarQuantidade);
router.delete('/:idCarrinho', carrinhoController.removerItem);

export default router;