import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';
import carrinhoRoutes from './routes/carrinhoRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : ['http://127.0.0.1:5500', 'http://localhost:5500'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', mensagem: 'API EduScience operando.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/carrinho', carrinhoRoutes);
app.use('/api/pedidos', pedidoRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  console.error('Erro não tratado na aplicação:', err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor escutando na porta ${PORT}`);
});

export default app;