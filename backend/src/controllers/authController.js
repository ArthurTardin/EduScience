import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { JWT_SECRET } from '../config/auth.js';

export async function login(req, res) {
  const { usuario, email, senha } = req.body;
  const identificador = (usuario || email || '').trim();

  if (!identificador || !senha) {
    return res.status(400).json({ erro: 'Usuário/e-mail e senha são obrigatórios.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT l.id_login, l.id_cliente, l.usuario, l.senha_hash, l.ativo,
              c.nome_escola, c.email
       FROM login l
       INNER JOIN cliente c ON c.id_cliente = l.id_cliente
       WHERE l.usuario = ? OR c.email = ?
       LIMIT 1`,
      [identificador, identificador.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const conta = rows[0];

    if (!conta.ativo) {
      return res.status(403).json({ erro: 'Conta inativa. Entre em contato com o suporte.' });
    }

    const senhaValida = await bcrypt.compare(senha, conta.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    await pool.execute(
      `UPDATE login SET ultimo_acesso = NOW() WHERE id_login = ?`,
      [conta.id_login]
    );

    const token = jwt.sign(
      {
        id_cliente: conta.id_cliente,
        usuario: conta.usuario,
        email: conta.email
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      cliente: {
        id_cliente: conta.id_cliente,
        nome_escola: conta.nome_escola,
        usuario: conta.usuario,
        email: conta.email
      }
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return res.status(500).json({ erro: 'Erro interno ao processar o login.' });
  }
}

export async function register(req, res) {
  const {
    nome_escola, cnpj_cpf, email, telefone,
    logradouro, numero, complemento, bairro, cidade, estado, cep,
    usuario, senha
  } = req.body;

  if (!nome_escola || !cnpj_cpf || !email || !telefone ||
      !logradouro || !numero || !bairro || !cidade || !estado || !cep ||
      !usuario || !senha) {
    return res.status(400).json({ erro: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [clienteResult] = await connection.execute(
      `INSERT INTO cliente (nome_escola, cnpj_cpf, email, telefone)
       VALUES (?, ?, ?, ?)`,
      [nome_escola.trim(), cnpj_cpf.trim(), email.trim().toLowerCase(), telefone.trim()]
    );

    const idCliente = clienteResult.insertId;

    await connection.execute(
      `INSERT INTO cadastro (id_cliente, logradouro, numero, complemento, bairro, cidade, estado, cep)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idCliente,
        logradouro.trim(),
        numero.trim(),
        complemento ? complemento.trim() : null,
        bairro.trim(),
        cidade.trim(),
        estado.trim().toUpperCase(),
        cep.trim()
      ]
    );

    const senhaHash = await bcrypt.hash(senha, 10);

    await connection.execute(
      `INSERT INTO login (id_cliente, usuario, senha_hash, ativo)
       VALUES (?, ?, ?, TRUE)`,
      [idCliente, usuario.trim(), senhaHash]
    );

    await connection.commit();

    const token = jwt.sign(
      { id_cliente: idCliente, usuario: usuario.trim(), email: email.trim().toLowerCase() },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso.',
      id_cliente: idCliente,
      token
    });
  } catch (error) {
    await connection.rollback();

    if (error.code === 'ER_DUP_ENTRY') {
      let campo = 'E-mail';
      if (error.message.includes('usuario')) campo = 'Usuário';
      else if (error.message.includes('cnpj_cpf')) campo = 'CNPJ/CPF';
      return res.status(409).json({ erro: `${campo} já cadastrado no sistema.` });
    }

    console.error('Erro ao cadastrar cliente:', error);
    return res.status(500).json({ erro: 'Erro interno ao processar o cadastro.' });
  } finally {
    connection.release();
  }
}