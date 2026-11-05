import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';
import { rateLimitAuthRoutes } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/login', rateLimitAuthRoutes, login);

router.get('/me', rateLimitAuthRoutes, autenticarToken, (req, res) => {
    return res.status(200).json({
        message: 'Acesso autorizado à rota protegida.',
        usuario: req.usuario
    });
});

export default router;