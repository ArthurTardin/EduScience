import express from 'express';
import cors from 'cors';
import produtoRoutes from './routes/produtoRoutes.js';
import carrinhoRoutes from './routes/carrinhoRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/produtos', produtoRoutes);
app.use('/api/carrinho', carrinhoRoutes);
app.use('/api/checkout', checkoutRoutes);

app.use((req, res) => {
    res.status(404).json({mensagem: 'Rota não encontrada.'});
});

export default app;