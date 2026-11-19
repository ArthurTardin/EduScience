const rateLimitStore = new Map();

const janitor = setInterval(() => {
    const agora = Date.now();
    for (const [chave, dados] of rateLimitStore.entries()) {
        if (agora > dados.expiraEm) {
            rateLimitStore.delete(chave);
        }
    }
}, 60 * 1000);

janitor.unref();

export function rateLimitAuthRoutes(req, res, next) {
    const chave = req.ip || req.socket?.remoteAddress || 'desconhecido';
    const agora = Date.now();
    const janelaMs = 60 * 1000;
    const limite = 15;

    const atual = rateLimitStore.get(chave);

    if (!atual || agora > atual.expiraEm) {
        rateLimitStore.set(chave, { contador: 1, expiraEm: agora + janelaMs });
        return next();
    }

    if (atual.contador >= limite) {
        const segundosRestantes = Math.ceil((atual.expiraEm - agora) / 1000);
        res.setHeader('Retry-After', String(segundosRestantes));
        return res.status(429).json({
            error: `Muitas requisições. Tente novamente em ${segundosRestantes}s.`
        });
    }

    atual.contador += 1;
    return next();
}