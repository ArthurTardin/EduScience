import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONNECTION_LIMIT
})

export async function getConnection() {
    try {
        const conn = await pool.getConnection();
        return conn;
    } catch(err) {
        console.error('Erro ao conectar ao MariaDB:', err);
        throw err;
    }
}

export { pool };