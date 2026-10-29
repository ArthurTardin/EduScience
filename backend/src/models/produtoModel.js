import { pool } from '../config/database.js';

export async function buscarTodos() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM produto WHERE ativo = TRUE');
        return rows;
    } finally {
        if (conn) conn.release();
    }
}

export async function buscarPorId(id) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM produto WHERE id_produto = ? AND ativo = TRUE', [id]);
        return rows[0];
    } finally {
        if (conn) conn.release();
    }
}