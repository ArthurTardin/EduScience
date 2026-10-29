import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({status: 'API EduScience operando normalmente com ES Module. '});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`[EduScience API] Servidor rodando na porta ${PORT}`);
})