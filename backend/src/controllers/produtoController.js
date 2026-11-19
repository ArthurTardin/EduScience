import * as produtoModel from '../models/produtoModel.js';

export async function listarTodos(req, res) {
    try {
        const produtos = await produtoModel.buscarTodos();
        return res.status(200).json(produtos);
    } catch (err) {
        console.error('Erro ao listar produtos:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

export async function buscarPorId(req, res) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'ID do produto inválido.' });
        }

        const produto = await produtoModel.buscarPorId(id);
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        return res.status(200).json(produto);
    } catch (err) {
        console.error('Erro ao buscar produto:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}