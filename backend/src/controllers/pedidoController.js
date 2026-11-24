import { pool } from '../config/database.js';
import { emitirNotaFiscal, buscarNotaFiscalPorPedido } from '../services/notaFiscalService.js';

const MAPA_PAGAMENTO = {
  pix: 'PIX',
  cartao: 'Cartao',
  card: 'Cartao',
  boleto: 'Boleto',
  invoice: 'Boleto',
  empenho: 'Boleto'
};

function normalizarMetodoPagamento(valor) {
  const chave = String(valor || 'PIX').trim().toLowerCase();
  return MAPA_PAGAMENTO[chave] || null;
}

export async function criarPedido(req, res) {
  const idCliente = req.user?.id_cliente || req.usuario?.id_cliente;
  const metodoBruto =
    req.body?.metodo_pagamento ?? req.body?.metodoPagamento ?? req.body?.formaPagamento ?? 'PIX';
  const metodoPagamento = normalizarMetodoPagamento(metodoBruto);
  const valorFrete = Number(req.body?.valor_frete ?? req.body?.valorFrete ?? req.body?.frete ?? 0);
  const itensBody = Array.isArray(req.body?.itens) ? req.body.itens : [];

  if (!idCliente) {
    return res.status(401).json({ error: 'Cliente não autenticado.' });
  }

  if (!metodoPagamento) {
    return res.status(400).json({ error: 'Método de pagamento inválido.' });
  }

  if (Number.isNaN(valorFrete) || valorFrete < 0) {
    return res.status(400).json({ error: 'Valor de frete inválido.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    let [itensOrigem] = await conn.execute(
      `SELECT
          c.id_produto,
          c.quantidade,
          p.preco,
          p.estoque,
          p.nome_kit,
          p.ativo
       FROM carrinho_de_compra c
       JOIN produto p ON c.id_produto = p.id_produto
       WHERE c.id_cliente = ?
       FOR UPDATE`,
      [idCliente]
    );

    if (itensOrigem.length === 0 && itensBody.length > 0) {
      const consolidados = new Map();
      for (const raw of itensBody) {
        const idProd = Number(raw?.produtoId ?? raw?.id_produto ?? raw?.id);
        const qtd = Number(raw?.quantidade ?? 1);
        if (!Number.isInteger(idProd) || idProd <= 0 || !Number.isInteger(qtd) || qtd <= 0) {
          await conn.rollback();
          return res.status(400).json({ error: 'Item do pedido inválido.' });
        }
        consolidados.set(idProd, (consolidados.get(idProd) || 0) + qtd);
      }

      const ids = Array.from(consolidados.keys());
      const placeholders = ids.map(() => '?').join(', ');
      const [produtosDb] = await conn.execute(
        `SELECT id_produto, preco, estoque, nome_kit, ativo
         FROM produto
         WHERE id_produto IN (${placeholders})
         FOR UPDATE`,
        ids
      );

      if (produtosDb.length !== ids.length) {
        await conn.rollback();
        return res.status(404).json({ error: 'Um ou mais produtos do pedido não foram encontrados.' });
      }

      itensOrigem = produtosDb.map((prod) => ({
        id_produto: prod.id_produto,
        quantidade: consolidados.get(prod.id_produto),
        preco: prod.preco,
        estoque: prod.estoque,
        nome_kit: prod.nome_kit,
        ativo: prod.ativo
      }));
    }

    if (itensOrigem.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Não é possível criar pedido com o carrinho vazio.' });
    }

    let subtotalProdutos = 0;
    for (const item of itensOrigem) {
      if (!item.ativo) {
        await conn.rollback();
        return res.status(400).json({
          error: `O produto "${item.nome_kit}" não está mais disponível para venda.`
        });
      }

      if (item.estoque < item.quantidade) {
        await conn.rollback();
        return res.status(400).json({
          error: `Estoque insuficiente para "${item.nome_kit}". Disponível: ${item.estoque}, solicitado: ${item.quantidade}.`
        });
      }

      subtotalProdutos += Number(item.preco) * item.quantidade;
    }

    const subtotalArredondado = Number(subtotalProdutos.toFixed(2));
    const descontoPix = metodoPagamento === 'PIX' ? Number((subtotalArredondado * 0.05).toFixed(2)) : 0;
    const descontoInformado = Number(req.body?.desconto ?? 0);
    const descontoAplicado =
      !Number.isNaN(descontoInformado) && descontoInformado > 0
        ? Math.min(subtotalArredondado, Number(descontoInformado.toFixed(2)))
        : descontoPix;

    const valorTotal = Number(
      Math.max(0, subtotalArredondado - descontoAplicado + valorFrete).toFixed(2)
    );

    const [resCompra] = await conn.execute(
      `INSERT INTO compra (id_cliente, valor_frete, valor_total, status_pedido, metodo_pagamento)
       VALUES (?, ?, ?, 'Confirmado', ?)`,
      [idCliente, valorFrete, valorTotal, metodoPagamento]
    );

    const idCompra = resCompra.insertId;

    const itensRegistrados = [];
    for (const item of itensOrigem) {
      const precoUnitario = Number(item.preco);
      const subtotalItem = Number((precoUnitario * item.quantidade).toFixed(2));

      await conn.execute(
        `INSERT INTO venda (id_compra, id_produto, quantidade, preco_unitario)
         VALUES (?, ?, ?, ?)`,
        [idCompra, item.id_produto, item.quantidade, precoUnitario]
      );

      await conn.execute(
        `UPDATE produto SET estoque = estoque - ? WHERE id_produto = ?`,
        [item.quantidade, item.id_produto]
      );

      itensRegistrados.push({
        id_produto: item.id_produto,
        nome_kit: item.nome_kit,
        quantidade: item.quantidade,
        preco_unitario: precoUnitario,
        subtotal: subtotalItem
      });
    }

    const notaFiscal = await emitirNotaFiscal(idCompra, conn);

    await conn.execute(
      `DELETE FROM carrinho_de_compra WHERE id_cliente = ?`,
      [idCliente]
    );

    await conn.commit();

    return res.status(201).json({
      message: 'Pedido criado e Nota Fiscal emitida com sucesso.',
      pedido: {
        id_compra: idCompra,
        id_cliente: idCliente,
        subtotal: subtotalArredondado,
        desconto: descontoAplicado,
        valor_frete: valorFrete,
        valor_total: valorTotal,
        status_pedido: 'Confirmado',
        metodo_pagamento: metodoPagamento,
        itens: itensRegistrados
      },
      nota_fiscal: notaFiscal
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Erro na transação de criação de pedido:', err);
    return res.status(500).json({ error: 'Erro interno ao registrar pedido.' });
  } finally {
    if (conn) conn.release();
  }
}

export async function obterNotaFiscalPedido(req, res) {
  const idCliente = req.user?.id_cliente || req.usuario?.id_cliente;
  const idCompra = Number(req.params.id);

  if (!idCliente) {
    return res.status(401).json({ error: 'Cliente não autenticado.' });
  }

  if (!Number.isInteger(idCompra) || idCompra <= 0) {
    return res.status(400).json({ error: 'ID do pedido inválido.' });
  }

  try {
    const comprovante = await buscarNotaFiscalPorPedido(idCompra, idCliente);

    if (!comprovante) {
      return res.status(404).json({
        error: 'Nota Fiscal não encontrada para este pedido ou acesso não autorizado.'
      });
    }

    return res.status(200).json(comprovante);
  } catch (err) {
    console.error('Erro ao buscar Nota Fiscal:', err);
    return res.status(500).json({ error: 'Erro interno ao consultar Nota Fiscal.' });
  }
}