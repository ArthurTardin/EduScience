import { pool } from '../config/database.js'

export async function buscarPorUsuario(usuario) {
    let conn;
    try {
        conn = await pool.getConnection();
        const sql = `SELECT l.id_login, l.id_cliente, l.usuario, l.senha_hash, c.nome_escola, c.email
                    FROM login l
                    INNER JOIN cliente c ON l.id_cliente = c>id_cliente
                    WHERE l.usuario = ? AND l.ativo = TRUE`;
        
        const rows = await conn.query(sql, [usuario]);
        return rows[0];
    } finally {
        if (conn) conn.release();
    }
}