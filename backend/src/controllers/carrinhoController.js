import * as carrinhoModel from '../models/carrinhoModel.js';

export async function listarItens(req, res) {
    try {
        const { idCliente } = req.params;
        const itens = await carrinhoModel.listarPorCliente(idCliente);
        return res.status(200).json(itens);
    } catch (err) {
        console.error('Erro ao listar carrinho:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

export async function adicionarItem(req, res) {
    try {
        const { idCliente, idProduto, quantidade } = req.body;
        if (!idCliente || !idProduto || !quantidade) {
            return res.status(400).json({ error: 'idCliente, idProduto e quantidade são obrigatórios.' });
        }

        const item = await carrinhoModel.adicionarOuAtualizar(idCliente, idProduto, quantidade);
        return res.status(201).json({ message: 'Item adicionado ao carrinho.', item });
    } catch (err) {
        console.error('Erro ao adicionar item:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

export async function atualizarQuantidade(req, res) {
    try {
        const { idCarrinho } = req.params;
        const { quantidade } = req.body;

        if (quantidade <= 0) {
            return res.status(400).json({ error: 'A quantidade deve ser maior que zero.' });
        }

        const atualizado = await carrinhoModel.atualizarQuantidade(idCarrinho, quantidade);
        if (!atualizado) {
            return res.status(404).json({ error: 'Item do carrinho não encontrado.' });
        }

        return res.status(200).json({ message: 'Quantidade atualizada.' });
    } catch (err) {
        console.error('Erro ao atualizar quantidade:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

export async function removerItem(req, res) {
    try {
        const { idCarrinho } = req.params;
        const removido = await carrinhoModel.removerItem(idCarrinho);
        if (!removido) {
            return res.status(404).json({ error: 'Item não encontrado no carrinho.' });
        }

        return res.status(200).json({ message: 'Item removido com sucesso.' });
    } catch (err) {
        console.error('Erro ao remover item:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}