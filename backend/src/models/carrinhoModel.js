import { pool } from '../config/database.js';

export async function listarPorCliente(idCliente) {
    const query = `
        SELECT 
            c.id_carrinho AS id,
            c.id_carrinho,
            c.id_produto, 
            c.quantidade, 
            p.nome_kit AS nome, 
            p.sku,
            p.categoria,
            p.preco
        FROM carrinho_de_compra c
        JOIN produto p ON c.id_produto = p.id_produto
        WHERE c.id_cliente = ?
    `;
    const [linhas] = await pool.execute(query, [idCliente]);
    return linhas;
}

export async function adicionarOuAtualizar(idCliente, idProduto, quantidade) {
    const queryExiste = `SELECT id_carrinho, quantidade FROM carrinho_de_compra WHERE id_cliente = ? AND id_produto = ?`;
    const [existente] = await pool.execute(queryExiste, [idCliente, idProduto]);

    if (existente.length > 0) {
        const novaQtd = existente[0].quantidade + quantidade;
        const queryUpdate = `UPDATE carrinho_de_compra SET quantidade = ? WHERE id_carrinho = ?`;
        await pool.execute(queryUpdate, [novaQtd, existente[0].id_carrinho]);
        return { id: existente[0].id_carrinho, id_carrinho: existente[0].id_carrinho, idCliente, idProduto, quantidade: novaQtd };
    }

    const queryInsert = `INSERT INTO carrinho_de_compra (id_cliente, id_produto, quantidade) VALUES (?, ?, ?)`;
    const [resultado] = await pool.execute(queryInsert, [idCliente, idProduto, quantidade]);
    return { id: resultado.insertId, id_carrinho: resultado.insertId, idCliente, idProduto, quantidade };
}

export async function atualizarQuantidade(idCarrinho, quantidade) {
    const query = `UPDATE carrinho_de_compra SET quantidade = ? WHERE id_carrinho = ?`;
    const [resultado] = await pool.execute(query, [quantidade, idCarrinho]);
    return resultado.affectedRows > 0;
}

export async function removerItem(idCarrinho) {
    const query = `DELETE FROM carrinho_de_compra WHERE id_carrinho = ?`;
    const [resultado] = await pool.execute(query, [idCarrinho]);
    return resultado.affectedRows > 0;
}