import { pool } from '../config/database.js';
import { emitirNotaFiscal, buscarNotaFiscalPorPedido } from '../services/notaFiscalService.js';

export async function criarPedido(req, res) {
    const idCliente = req.user?.id_cliente || req.usuario?.id_cliente;
    const metodoPagamento = req.body?.metodo_pagamento || req.body?.metodoPagamento || 'PIX';
    const valorFrete = Number(req.body?.valor_frete ?? req.body?.valorFrete ?? 0);
    
    if (!idCliente) {
        return res.status(401).json({ error: 'Cliente não autenticado.'});
    }

    if (Number.isNaN(valorFrete) || valorFrete < 0) {
        return res.status(400).json({ error: 'Valor de frete inválido.'});
    }

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [itensCarrinho] = await conn.execute(
            `SELECT 
                c.id_carrinho,
                c.id_produto, 
                c.quantidade, 
                p.preco, 
                p.estoque, 
                p.nome_kit,
                p.ativo
             FROM carrinho_de_compra c
             JOIN produto p ON c.id_produto = p.id_produto
             WHERE c.id_cliente = ?
             FOR UPDATE`,
             [idCliente]
        );

        if (itensCarrinho.length === 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'Não é possível criar pedido com o carrinho vazio.' });
        }

        let subtotalProdutos = 0;
        for (const item of itensCarrinho) {
            if (!item.ativo) {
                await conn.rollback();
                return res.status(400).json({
                    error: `O produto "${item.nome_kit}" não está mais disponível para venda.`
                });
            }

            if (item.estoque < item.quantidade) {
                await conn.rollback();
                return res.status(400).json({
                    error: `Estoque insuficiente para "${item.nome_kit}. Disponível: ${item.estoque}, solicitado: ${item.quantidade}.`
                });
            }

            subtotalProdutos += Number(item.preco) * item.quantidade;
        }

        const valorTotal = Number((subtotalProdutos + valorFrete).toFixed(2));

        const [resCompra] = await conn.execute(
            `INSERT INTO compra (id_cliente, valor_frete, valor_total, status_pedido, metodo_pagamento)
             VALUES (?, ?, ?, 'Confirmado', ?)`,
             [idCliente, valorFrete, valorTotal, metodoPagamento]
        );

        const idCompra = resCompra.insertId;

        const itensRegistrados = [];
        for (const item of itensCarrinho) {
            const precoUnitario = Number(item.preco);
            const subtotalItem = Number((precoUnitario * item.quantidade).toFixed(2));

            await conn.execute(
                `INSERT INTO venda (id_compra, id_produto, quantidade, preco_unitario, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
                [idCompra, item.id_produto, item.quantidade, precoUnitario, subtotalItem]
            );

            await conn.execute(
                `UPDATE produto SET estoque = estoque - ? WHERE id_produto = ?`,
                [item.quantidade, item.id_produto]
            );

            itensRegistrados.push({
                id_produto: item.id_produto,
                nome_kit: item.nome_kit,
                quantidade: item.quantidade,
                preco_unitario: precoUnitario,
                subtotal: subtotalItem
            });
        }

        const notasFiscal = await emitirNotaFiscal(idCompra, conn);

        await conn.execute(
            `DELETE FROM carrinho_de_compra WHERE id_cliente = ?`,
            [idCliente]
        );

        await conn.commit();

        return res.status(201).json({
           message: 'Pedido criado e Nota Fiscal emitida com sucesso.',
            pedido: {
                id_compra: idCompra,
                id_cliente: idCliente,
                subtotal: Number(subtotalProdutos.toFixed(2)),
                valor_frete: valorFrete,
                valor_total: valorTotal,
                status_pedido: 'Confirmado',
                metodo_pagamento: metodoPagamento,
                itens: itensRegistrados
            },
            nota_fiscal: notasFiscal
        });
    } catch(err) {
        if (conn) await conn.rollback();
        console.error('Erro na transação de criação de pedido:', err);
        return res.status(500).json({ error: 'Erro interno ao registrar pedido. '});
    } finally {
        if (conn) conn.release();
    }
}

export async function obterNotaFiscalPedido(req, res) {
    const idCliente = req.user?.id_cliente || req.usuario?.id_cliente;
    const idCompra = Number(req.params.id);

    if (!idCliente) {
        return res.status(401).json({ error: 'Cliente não autenticado.' });
    }

    if (!Number.isInteger(idCompra) || idCompra <= 0) {
        return res.status(400).json({ error: 'ID do pedido inválido.' });
    } 

    try {
        const comprovante = await buscarNotaFiscalPorPedido(idCompra, idCliente);

        if (!comprovante) {
            return res.status(404).json({
                error: 'Nota Fiscal não encontrado para este pedido ou acesso não autorizado.'
            });
        }

        return  res.status(200).json(comprovante);
    } catch(err) {
        console.error('Erro ao buscar Nota Fiscal:', err);
        return res.status(500).json({ error: 'Erro interno ao consultar Nota Fiscal' });
    }
}