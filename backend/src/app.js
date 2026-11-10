import express from 'express';
import cors from 'cors';
import produtoRoutes from './routes/produtoRoutes.js';
import carrinhoRoutes from './routes/carrinhoRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', mensagem: 'API EduScience operando.' });
});

app.use('/api/produtos', produtoRoutes);
app.use('/api/carrinho', carrinhoRoutes);
app.use('/api/checkout', checkoutRoutes);

app.use((req, res) => {
    res.status(404).json({mensagem: 'Rota não encontrada.'});
});

app.listen(PORT, () => {
  console.log(`Servidor escutando na porta ${PORT}`);
});

export default app;