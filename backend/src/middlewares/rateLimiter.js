const rateLimitStore = new Map();

setInterval(() => {
    const agora = Date.now();
    for (const [chave, dados] of rateLimitStore.entries()) {
        if (agora > dados.expiraEm) {
            rateLimitStore.delete(chave);
        }
    }
}, 5 * 60 * 1000);

export function rateLimitAuthRoutes(req, res, next) {
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