import { Router } from 'express';
import * as produtoController from '../controllers/produtoController.js';

const router = Router();

router.get('/', produtoController.listarTodos);
router.get('/:id', produtoController.buscarPorId);

export default router;