import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { JWT_SECRET } from '../config/auth.js';

function gerarUsuarioBase(email, nome) {
  const origem = (email || nome || 'usuario').split('@')[0];
  const limpo = origem.toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 35) || 'usuario';
  const sufixo = Math.floor(1000 + Math.random() * 9000);
  return `${limpo}_${sufixo}`;
}

export async function login(req, res) {
  const { usuario, email, senha } = req.body;
  const identificador = String(usuario || email || '').trim();

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
  const body = req.body || {};

  const nomeResponsavel = String(body.nome || '').trim();
  const nomeEscola = String(body.nome_escola || body.escola || nomeResponsavel).trim();
  const cnpjCpf = String(body.cnpj_cpf || body.documento || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const telefone = String(body.telefone || '').trim();

  const logradouro = String(body.logradouro || 'A informar').trim();
  const numero = String(body.numero || 'S/N').trim().slice(0, 10);
  const complemento = body.complemento ? String(body.complemento).trim().slice(0, 100) : null;
  const bairro = String(body.bairro || 'A informar').trim();
  const cidade = String(body.cidade || 'São Paulo').trim();
  const estado = String(body.estado || body.uf || 'SP').trim().toUpperCase().slice(0, 2);
  const cep = String(body.cep || '00000-000').trim().slice(0, 9);

  const usuario = String(body.usuario || '').trim() || gerarUsuarioBase(email, nomeResponsavel);
  const senha = String(body.senha || '');

  if (!nomeEscola || !cnpjCpf || !email || !telefone || !senha) {
    return res.status(400).json({ erro: 'Nome/escola, documento, e-mail, telefone e senha são obrigatórios.' });
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
      [nomeEscola, cnpjCpf, email, telefone]
    );

    const idCliente = clienteResult.insertId;

    await connection.execute(
      `INSERT INTO cadastro (id_cliente, logradouro, numero, complemento, bairro, cidade, estado, cep)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [idCliente, logradouro, numero, complemento, bairro, cidade, estado, cep]
    );

    const senhaHash = await bcrypt.hash(senha, 10);

    await connection.execute(
      `INSERT INTO login (id_cliente, usuario, senha_hash, ativo)
       VALUES (?, ?, ?, TRUE)`,
      [idCliente, usuario, senhaHash]
    );

    await connection.commit();

    const token = jwt.sign(
      { id_cliente: idCliente, usuario, email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso.',
      id_cliente: idCliente,
      usuario,
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