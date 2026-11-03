import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', login);

router.get('/me', autenticarToken, (req, res) => {
    res.status(200).json({
        message: 'Acesso autorizado à rota protegida.',
        usuario: req.usuario
    });
});

export default router;