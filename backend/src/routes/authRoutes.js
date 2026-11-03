import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = Router();
const rateLimitStore = new Map();

function rateLimitAuthRoutes(req, res, next) {
    const chave = req.ip || req.socket?.remoteAddress || 'desconhecido';
    const agora = Date.now();
    const janelaMs = 60 * 1000;
    const limite = 60;
    const atual = rateLimitStore.get(chave);

    if (!atual || agora > atual.expiraEm) {
        rateLimitStore.set(chave, { contador: 1, expiraEm: agora + janelaMs });
        return next();
    }

    if (atual.contador >= limite) {
        return res.status(429).json({
            error: 'Muitas requisições. Tente novamente em instantes.'
        });
    }

    atual.contador += 1;
    return next();
}

router.post('/login', rateLimitAuthRoutes, login);

router.get('/me', rateLimitAuthRoutes, autenticarToken, (req, res) => {
    res.status(200).json({
        message: 'Acesso autorizado à rota protegida.',
        usuario: req.usuario
    });
});

export default router;