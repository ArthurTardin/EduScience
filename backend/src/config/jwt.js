import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error('JWT_SECRET não configurado. Defina JWT_SECRET nas variáveis de ambiente.');
}

export default jwtSecret;
