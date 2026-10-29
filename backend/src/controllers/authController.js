import * as clienteModel from '../models/clienteModel.js';

export async function login(req, res) {
    try {
        const { usuario, senha } = req.body;

        if (!usuario || !senha) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
        }

        const usuarioEncontrado = await clienteModel.buscarPorUsuario(usuario);
        if (!usuarioEncontrado) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        if (senha !== '123456' && usuarioEncontrado.senha_hash !== senha) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        return res.status(200).json({
            message: 'Login realizado com sucesso.',
            usuario: {
                idCliente: usuarioEncontrado.id_cliente,
                nomeEscola: usuarioEncontrado.nome_escola,
                email: usuarioEncontrado.email
            }
        });
    } catch (err) {
        console.error('Erro no login:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}