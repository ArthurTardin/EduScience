import { pool } from '../config/database.js';

export async function processarCheckout(req, res) {
    const idCliente = req.user?.id_cliente || req.usuario?.id_cliente;
    const metodoPagamento = req.body?.metodo_pagamento || req.body?.metodoPagamento || 'PIX';
    const valorFrete = Number(req.body?.valor_frete || req.body?.valorFrete || 0);

    if (!idCliente) {
        return res.status(401).json({ error: 'Cliente não identificado no token.' });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [itensCarrinho] = await conn.execute(
            `SELECT c.id_produto, c.quantidade, p.preco, p.estoque, p.nome_kit
             FROM carrinho_de_compra c
             JOIN produto p ON c.id_produto = p.id_produto
             WHERE c.id_cliente = ?`,
            [idCliente]
        );

        if (itensCarrinho.length === 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'O carrinho está vazio.' });
        }

        let subtotalProdutos = 0;
        for (const item of itensCarrinho) {
            if (item.estoque < item.quantidade) {
                await conn.rollback();
                return res.status(400).json({
                    error: `Estoque insuficiente para "${item.nome_kit}". Disponível: ${item.estoque}.`
                });
            }
            subtotalProdutos += Number(item.preco) * item.quantidade;
        }

        const valorTotal = subtotalProdutos + valorFrete;

        const [resCompra] = await conn.execute(
            `INSERT INTO compra (id_cliente, valor_frete, valor_total, status_pedido, metodo_pagamento)
             VALUES (?, ?, ?, 'Confirmado', ?)`,
            [idCliente, valorFrete, valorTotal, metodoPagamento]
        );

        const idCompra = resCompra.insertId;

        for (const item of itensCarrinho) {
            const subtotalItem = Number(item.preco) * item.quantidade;

            await conn.execute(
                `INSERT INTO venda (id_compra, id_produto, quantidade, preco_unitario, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
                [idCompra, item.id_produto, item.quantidade, item.preco, subtotalItem]
            );

            await conn.execute(
                `UPDATE produto SET estoque = estoque - ? WHERE id_produto = ?`,
                [item.quantidade, item.id_produto]
            );
        }

        await conn.execute(
            `DELETE FROM carrinho_de_compra WHERE id_cliente = ?`,
            [idCliente]
        );

        await conn.commit();

        return res.status(201).json({
            message: 'Compra finalizada com sucesso.',
            pedido: {
                id_compra: idCompra,
                subtotal: subtotalProdutos,
                valor_frete: valorFrete,
                valor_total: valorTotal,
                status_pedido: 'Confirmado',
                metodo_pagamento: metodoPagamento
            }
        });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('Erro ao processar checkout:', err);
        return res.status(500).json({ error: 'Erro interno ao processar checkout.' });
    } finally {
        if (conn) conn.release();
    }
}