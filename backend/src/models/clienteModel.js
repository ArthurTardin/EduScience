import { pool } from '../config/database.js';

export async function buscarPorLogin(usuario) {
    const query = `
        SELECT 
            l.id_login,
            l.usuario,
            l.senha_hash,
            c.id_cliente,
            c.nome_escola,
            c.email
        FROM login l
        INNER JOIN cliente c ON l.id_cliente = c.id_cliente
        WHERE l.usuario = ? AND l.ativo = 1
    `;

    const [rows] = await pool.execute(query, [usuario]);

    if (!rows || rows.length === 0) {
        return null;
    }

    const row = rows[0];

    return {
        id_login: row.id_login,
        usuario: row.usuario,
        senha: row.senha_hash,
        id_cliente: row.id_cliente,
        nome_escola: row.nome_escola,
        email: row.email
    };
}