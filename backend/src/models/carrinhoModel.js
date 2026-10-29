import { pool } from '../config/database.js'

export async function listarPorCliente(idCliente) {
    let conn;
    try {
        conn = await pool.getConnection();
        const sql = `SELECT car.id_carrinho, car.id_produto, p.nome_kit, p.categoria, p.preco, car.quantidade,
                            (car.quantidade * p.preco) AS subtotal
                    FROM carrinho_de_compra car
                    INNER JOIN produto p ON car.id_produto = p.id_produto
                    WHERE car.id_cliente = ?`;

        const rows = await conn.query(sql, [idCliente]);
        return rows
    } finally {
        if (conn) conn.release();
    }
}

export async function adicionarOuAtualizar(idCliente, idProduto, quantidade) {
    let conn;
    try {
        conn = await pool.getConnection();
        const sqlCheck = `SELECT id_carrinho, quantidade FROM carrinho_de_compra WHERE id_cliente = ? AND id_produto = ?`;
        const itemExistente = await conn.query(sqlCheck, [idCliente, idProduto]);

        if (itemExistente.length > 0) {
            const novaQtd = itemExistente[0].quantidade + quantidade;
            const sqlUpdate = `UPDATE carrinho_de_compra SET quantidade = ? WHERE id_carrinho = ?`;
            await conn.query(sqlUpdate, [novaQtd, itemExistente[0].id_carrinho]);
            return { id_carrinho: itemExistente[0].id_carrinho, quantidade: novaQtd };
        } else {
            const sqlInsert = `INSERT INTO carrinho_de_compra (id_cliente, id_produto, quantidade) VALUES (?, ?, ?)`;
            const result = await conn.query(sqlInsert, [idCliente, idProduto, quantidade]);
            return { id_carrinho: Number(result.insertId), quantidade };
        }
    } finally {
        if (conn) conn.release();
    }
}

export async function atualizarQuantidade(idCarrinho, quantidade) {
    let conn;
    try {
        conn = await pool.getConnection();
        const sql = `UPDATE carrinho_de_compra SET quantidade = ? WHERE id_carrinho = ?`;
        const result = await conn.query(sql, [quantidade, idCarrinho]);
        return result.affectedRows > 0;
    } finally {
        if (conn) conn.release();
    }
}

export async function removerItem(idCarrinho) {
    let conn;
    try {
        conn = await pool.getConnection();
        const sql = `DELETE FROM carrinho_de_compra WHERE id_carrinho = ?`;
        const result = await conn.query(sql, [idCarrinho]);
        return result.affectedRows > 0;
    } finally {
        if (conn) conn.release();
    }
}