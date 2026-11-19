import { pool } from '../config/database.js';

export async function buscarTodos() {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM produto WHERE ativo = TRUE ORDER BY nome_kit ASC'
    );
    return rows;
  } catch (err) {
    console.error('ERRO MARIADB (buscarTodos):', err.message);
    throw err;
  }
}

export async function buscarPorId(id) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM produto WHERE id_produto = ? AND ativo = TRUE LIMIT 1',
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error('ERRO MARIADB (buscarPorId):', err.message);
    throw err;
  }
}