import { pool } from '../config/database.js';

const METODOS_PERMITIDOS = ['PIX', 'Cartao', 'Boleto'];

export async function processarCheckout(req, res) {
    const idCliente = req.user?.id_cliente || req.usuario?.id_cliente;
    const metodoPagamento = req.body?.metodo_pagamento || req.body?.metodoPagamento || 'PIX';
    const valorFrete = Math.max(0, Number(req.body?.valor_frete ?? req.body?.valorFrete ?? 0) || 0);

    if (!idCliente) {
        return res.status(401).json({ erro: 'Cliente não identificado no token.' });
    }

    if (!METODOS_PERMITIDOS.includes(metodoPagamento)) {
        return res.status(400).json({ erro: 'Método de pagamento inválido.' });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [itensCarrinho] = await conn.execute(
            `SELECT c.id_produto, c.quantidade, p.preco, p.estoque, p.nome_kit
             FROM carrinho_de_compra c
             JOIN produto p ON c.id_produto = p.id_produto
             WHERE c.id_cliente = ?
             FOR UPDATE`,
            [idCliente]
        );

        if (itensCarrinho.length === 0) {
            await conn.rollback();
            return res.status(400).json({ erro: 'O carrinho está vazio.' });
        }

        let subtotalProdutos = 0;
        for (const item of itensCarrinho) {
            if (item.estoque < item.quantidade) {
                await conn.rollback();
                return res.status(400).json({
                    erro: `Estoque insuficiente para "${item.nome_kit}". Disponível: ${item.estoque}.`
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
            mensagem: 'Compra finalizada com sucesso.',
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
        return res.status(500).json({ erro: 'Erro interno ao processar checkout.' });
    } finally {
        if (conn) conn.release();
    }
}