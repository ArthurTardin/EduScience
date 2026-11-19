import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth.js';

export function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Acesso negado. Token não fornecido ou malformado.'
        });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
        return res.status(401).json({
            error: 'Acesso negado. Token não fornecido.'
        });
    }

    try {
        const usuarioDecodificado = jwt.verify(token, JWT_SECRET);

        req.usuario = usuarioDecodificado;
        req.user = usuarioDecodificado;

        return next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token inválido ou expirado.'
        });
    }
}