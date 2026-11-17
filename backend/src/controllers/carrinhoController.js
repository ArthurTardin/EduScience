import * as carrinhoModel from '../models/carrinhoModel.js';

export async function listarItens(req, res) {
  try {
    const idCliente = req.user?.id_cliente;
    if (!idCliente) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const itens = await carrinhoModel.listarPorCliente(idCliente);
    return res.status(200).json(itens);
  } catch (err) {
    console.error('Erro ao listar carrinho:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

export async function adicionarItem(req, res) {
  try {
    const idCliente = req.user?.id_cliente;
    if (!idCliente) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const { idProduto, quantidade } = req.body;

    if (!idProduto || quantidade === undefined || quantidade === null) {
      return res.status(400).json({ erro: 'idProduto e quantidade são obrigatórios.' });
    }

    if (Number(quantidade) <= 0) {
      return res.status(400).json({ erro: 'A quantidade deve ser maior que zero.' });
    }

    const item = await carrinhoModel.adicionarOuAtualizar(idCliente, idProduto, Number(quantidade));
    return res.status(201).json({ mensagem: 'Item adicionado ao carrinho.', item });
  } catch (err) {
    console.error('Erro ao adicionar item:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

export async function atualizarQuantidade(req, res) {
  try {
    const idCliente = req.user?.id_cliente;
    if (!idCliente) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const { idCarrinho } = req.params;
    const { quantidade } = req.body;

    if (quantidade === undefined || quantidade === null) {
      return res.status(400).json({ erro: 'A quantidade é obrigatória.' });
    }

    if (Number(quantidade) <= 0) {
      const removido = await carrinhoModel.removerItem(idCarrinho, idCliente);
      if (!removido) {
        return res.status(404).json({ erro: 'Item do carrinho não encontrado.' });
      }
      return res.status(200).json({ mensagem: 'Item removido por quantidade zero.' });
    }

    const atualizado = await carrinhoModel.atualizarQuantidade(idCarrinho, Number(quantidade), idCliente);
    if (!atualizado) {
      return res.status(404).json({ erro: 'Item do carrinho não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Quantidade atualizada com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar quantidade:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

export async function removerItem(req, res) {
  try {
    const idCliente = req.user?.id_cliente;
    if (!idCliente) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    const { idCarrinho } = req.params;
    const removido = await carrinhoModel.removerItem(idCarrinho, idCliente);
    if (!removido) {
      return res.status(404).json({ erro: 'Item não encontrado no carrinho.' });
    }

    return res.status(200).json({ mensagem: 'Item removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover item:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}