import jwt from 'jsonwebtoken';

export function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Acesso negado. Token não fornecido.'
        });
    }

    try {
        const secret = process.env.JWT_SECRET || 'eduscience_chave_secreta_super_segura_2026';
        const usuarioDecodificado = jwt.verify(token, secret);

        req.usuario = usuarioDecodificado;
        return next();
    } catch (error) {
        return res.status(403).json({
            error: 'Token inválido ou expirado.'
        });
    }
}