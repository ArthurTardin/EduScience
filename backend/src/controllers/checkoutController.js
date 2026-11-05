import { pool } from '../config/database.js';

export async function processarCheckout(req, res) {
    const connection = await pool.getConnection();
    try {
        const { idCliente } = req.body;

        if (!idCliente) {
            return res.status(400).json({ error: 'idCliente é obrigatório.' });
        }

        await connection.beginTransaction()

        const [itens] = await connection.execute(
            `SELECT c.id_produto, c.quantidade, p.preco FROM carrinho c 
            JOIN produtos p ON c.id_produto = p.id WHERE c.id_cliente = ?`, [idCliente]
        );

        if (itens.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Carrinho vazio. Não é possível finalizar a compra. '});
        }

        const valorTotal = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

        const [pedidoResult] = await connection.execute(`
            INSERT INTO pedidos (id_cliente, valor_total, status) VALUES (?, ?, 'processando')`,
        [idCliente, valorTotal] );

        const idPedido = pedidoResult.insertId;

        for (const item of itens) {
            await connection.execute(`
                INSERT INTO pedidos_itens (id_pedido, id_produto, quantidade, preco_unitario)
                VALUES (?, ?, ?, ?)`, [idPedido, item.id_produto, item.quantidade, item.preco]);
        }

        await connection.execute(`DELETE FROM carrinho WHERE id_cliente = ?`, [idCliente]);

        await connection.commit();

        return res.status(201).json({
            message: 'Compra finalizada com sucesso!', idPedido, valorTotal
        });
    } catch (err) {
        await connection.rollback();
        console.error('Erro ao processar checkout:', err);
        return res.status(500).json({ error: 'Erro interno ao processar checkout. '});
    } finally {
        connection.release();
    }
}