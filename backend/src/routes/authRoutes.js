import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';
import { rateLimitAuthRoutes } from '../middlewares/rateLimiter.js';
import pool from '../config/database.js';

const router = Router();

router.post('/login', rateLimitAuthRoutes, login);
router.post('/register', rateLimitAuthRoutes, register);

router.get('/me', autenticarToken, async (req, res) => {
  const idCliente = req.user?.id_cliente || req.usuario?.id_cliente;
  if (!idCliente) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT
          c.id_cliente,
          c.nome_escola,
          c.cnpj_cpf,
          c.email,
          c.telefone,
          l.usuario,
          cad.logradouro,
          cad.numero,
          cad.complemento,
          cad.bairro,
          cad.cidade,
          cad.estado,
          cad.cep
       FROM cliente c
       LEFT JOIN login l ON l.id_cliente = c.id_cliente
       LEFT JOIN cadastro cad ON cad.id_cliente = c.id_cliente
       WHERE c.id_cliente = ?
       LIMIT 1`,
      [idCliente]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const row = rows[0];
    return res.status(200).json({
      cliente: {
        id_cliente: row.id_cliente,
        nome_escola: row.nome_escola,
        cnpj_cpf: row.cnpj_cpf,
        email: row.email,
        telefone: row.telefone,
        usuario: row.usuario,
        endereco: {
          logradouro: row.logradouro,
          numero: row.numero,
          complemento: row.complemento,
          bairro: row.bairro,
          cidade: row.cidade,
          estado: row.estado,
          cep: row.cep
        }
      }
    });
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar perfil.' });
  }
});

export default router;