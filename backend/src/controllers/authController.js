import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { buscarPorLogin } from '../models/clienteModel.js';
import jwtSecret from '../config/jwt.js';

export async function login(req, res) {
    try {
        const { usuario, senha } = req.body;

        if (!usuario || !senha) {
            return res.status(400).json({ 
                error: 'Usuário e senha são obrigatórios.' 
            });
        }

        const conta = await buscarPorLogin(usuario);

        if (!conta || !conta.senha) {
            return res.status(401).json({ 
                error: 'Usuário ou senha inválidos.' 
            });
        }

        const senhaValida = await bcrypt.compare(senha, conta.senha);

        if (!senhaValida) {
            return res.status(401).json({ 
                error: 'Usuário ou senha inválidos.' 
            });
        }

        const token = jwt.sign(
            { 
                id_cliente: conta.id_cliente,
                usuario: conta.usuario,
                email: conta.email 
            },
            jwtSecret,
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            message: 'Login realizado com sucesso.',
            token,
            usuario: {
                id: conta.id_cliente,
                nome: conta.nome_escola,
                usuario: conta.usuario,
                email: conta.email
            }
        });
    } catch (error) {
        console.error('Erro na autenticação:', error);
        return res.status(500).json({
            error: 'Erro interno no servidor ao realizar login.'
        });
    }
}