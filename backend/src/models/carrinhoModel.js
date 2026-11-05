import { pool } from '../config/database.js';

export async function listarPorCliente(idCliente) {
    const query = `
        SELECT c.id, c.id_produto, c.quantidade, p.nome, p.preco, p.imagem
        FROM carrinho c
        JOIN produtos p ON c.id_produto = p.id
        WHERE c.id_cliente = ?
    `;
    const [linhas] = await pool.execute(query, [idCliente]);
    return linhas;
}

export async function adicionarOuAtualizar(idCliente, idProduto, quantidade) {
    const queryExiste = `SELECT id, quantidade FROM carrinho WHERE id_cliente = ? AND id_produto = ?`;
    const [existente] = await pool.execute(queryExiste, [idCliente, idProduto]);

    if (existente.length > 0) {
        const novaQtd = existente[0].quantidade + quantidade;
        const queryUpdate = `UPDATE carrinho SET quantidade = ? WHERE id = ?`;
        await pool.execute(queryUpdate, [novaQtd, existente[0].id]);
        return { id: existente[0].id, idCliente, idProduto, quantidade: novaQtd };
    }

    const queryInsert = `INSERT INTO carrinho (id_cliente, id_produto, quantidade) VALUES (?, ?, ?)`;
    const [resultado] = await pool.execute(queryInsert, [idCliente, idProduto, quantidade]);
    return { id: resultado.insertId, idCliente, idProduto, quantidade };
}

export async function atualizarQuantidade(idCarrinho, quantidade) {
    const query = `UPDATE carrinho SET quantidade = ? WHERE id = ?`;
    const [resultado] = await pool.execute(query, [quantidade, idCarrinho]);
    return resultado.affectedRows > 0;
}

export async function removerItem(idCarrinho) {
    const query = `DELETE FROM carrinho WHERE id = ?`;
    const [resultado] = await pool.execute(query, [idCarrinho]);
    return resultado.affectedRows > 0;
}