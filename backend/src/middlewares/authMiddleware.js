import jwt from 'jsonwebtoken';
import jwtSecret from '../config/jwt.js';

export function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Acesso negado. Token não fornecido.'
        });
    }

    try {
        const usuarioDecodificado = jwt.verify(token, jwtSecret);

        req.usuario = usuarioDecodificado;
        return next();
    } catch (error) {
        return res.status(403).json({
            error: 'Token inválido ou expirado.'
        });
    }
}