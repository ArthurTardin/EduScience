import * as carrinhoModel from '../models/carrinhoModel.js';

export async function listarItens(req, res) {
    try {
        const idCliente = req.user?.id_cliente || req.params.idCliente;
        
        if (!idCliente) {
            return res.status(400).json({ error: 'Identificador do cliente não fornecido.' });
        }

        const itens = await carrinhoModel.listarPorCliente(idCliente);
        return res.status(200).json(itens);
    } catch (err) {
        console.error('Erro ao listar carrinho:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}

export async function adicionarItem(req, res) {
    try {
        const idCliente = req.user?.id_cliente || req.body.idCliente;
        const { idProduto, quantidade } = req.body;

        if (!idCliente || !idProduto || !quantidade) {
            return res.status(400).json({ error: 'idProduto e quantidade são obrigatórios.' });
        }

        if (Number(quantidade) <= 0) {
            return res.status(400).json({ error: 'A quantidade deve ser maior que zero.' });
        }

        const item = await carrinhoModel.adicionarOuAtualizar(idCliente, idProduto, Number(quantidade));
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

        if (quantidade === undefined || quantidade === null) {
            return res.status(400).json({ error: 'A quantidade é obrigatória.' });
        }

        if (Number(quantidade) <= 0) {
            const removido = await carrinhoModel.removerItem(idCarrinho);
            if (!removido) {
                return res.status(404).json({ error: 'Item do carrinho não encontrado.' });
            }
            return res.status(200).json({ message: 'Item removido por quantidade zero.' });
        }

        const atualizado = await carrinhoModel.atualizarQuantidade(idCarrinho, Number(quantidade));
        if (!atualizado) {
            return res.status(404).json({ error: 'Item do carrinho não encontrado.' });
        }

        return res.status(200).json({ message: 'Quantidade atualizada com sucesso.' });
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