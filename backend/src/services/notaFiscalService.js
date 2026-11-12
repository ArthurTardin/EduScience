import crypto from 'crypto';
import { pool } from '../config/database.js';

const ALIQUOTAS = {
    ICMS: 0.18,
    PIS: 0.0165,
    COFINS: 0.076
};

function gerarChaveAcesso44Digitos(idCompra, cnpjEmitente = '12345678000199') {
    const uf = '35';
    const agora = new Date();
    const aamm = `${String(agora.getFullYear()).slice(-2)}${String(agora.getMonth() + 1).padStart(2, '0')}`;
    const cnpjLimpo = cnpjEmitente.replace(/\D/g, '').padStart(14, '0').slice(0, 14);
    const modelo = '55';
    const serie = '001';
    const numeroNf9Digitos = String(idCompra).padStart(9, '0');
    const tipoEmissao = '1';
    const codigoNumerico = String(crypto.randomInt(10000000, 99999999));

    const base43 = `${uf}${aamm}${cnpjLimpo}${modelo}${serie}${numeroNf9Digitos}${tipoEmissao}${codigoNumerico}`;

    let peso = 2;
    let soma = 0;
    for (let i = base43.length - 1; i>= 0; i--) {
        soma += Number(base43[i]) * peso;
        peso = peso === 9 ? 2 : peso + 1;
    }

    const resto = soma % 11;
    const dv = resto === 0 || resto === 1 ? 0 : 11 - resto;

    return `${base43}${dv}`;
}

function calcularImpostos(valorProdutos) {
    const base = Number(valorProdutos);
    const icms = Number((base * ALIQUOTAS.ICMS).toFixed(2));
    const pis = Number((base * ALIQUOTAS.PIS).toFixed(2));
    const cofins = Number((base * ALIQUOTAS.COFINS).toFixed(2));
    const totalImpostos = Number((icms + pis + cofins).toFixed(2));

    return {
        aliquotas: {
            icms: '18.00%',
            pis: '1.65%',
            cofins: '7.60%'
        },
        valores: {
            base_calculo: base,
            icms,
            pis,
            cofins,
            total_tributos_aproximado: totalImpostos
        }
    };
}

export async function emitirNotaFiscal(idCompra, conn = pool) {
    const anoAtual = new Date().getFullYear();
    const numeroNf = `NF-${anoAtual}-${String(idCompra).padStart(6, '0')}`;
    const serie = '1';
    const chaveAcesso = gerarChaveAcesso44Digitos(idCompra);
    const xmlUrl = `/api/pedidos/${idCompra}/nota-fiscal/xml`;

    const [result] = await conn.execute(
        `INSERT INTO nota_fiscal (id_compra, numero_nf, serie, chave_acesso, xml_url)
         VALUES (?, ?, ?, ?, ?)`,
        [idCompra, numeroNf, serie, chaveAcesso, xmlUrl]
    );

    return {
        id_nota_fiscal: result.insertId,
        id_compra: idCompra,
        numero_nf: numeroNf,
        serie,
        chave_acesso: chaveAcesso,
        xml_url: xmlUrl
    };
}

export async function buscarNotaFiscalPorPedido(idCompra, idCliente) {
    const [rows] = await pool.execute(
        `SELECT 
            nf.id_nota_fiscal,
            nf.id_compra,
            nf.numero_nf,
            nf.serie,
            nf.chave_acesso,
            nf.data_emissao,
            nf.xml_url,
            c.data_compra,
            c.valor_frete,
            c.valor_total,
            c.status_pedido,
            c.metodo_pagamento,
            cli.id_cliente,
            cli.nome_escola,
            cli.cnpj_cpf,
            cli.email,
            cli.telefone,
            cad.logradouro,
            cad.numero,
            cad.complemento,
            cad.bairro,
            cad.cidade,
            cad.estado,
            cad.cep
         FROM nota_fiscal nf
         JOIN compra c ON nf.id_compra = c.id_compra
         JOIN cliente cli ON c.id_cliente = cli.id_cliente
         LEFT JOIN cadastro cad ON cli.id_cliente = cad.id_cliente
         WHERE nf.id_compra = ? AND c.id_cliente = ?`,
        [idCompra, idCliente]
    );

    if (rows.length === 0) {
        return null;
    }

    const dados = rows[0];

    const [itens] = await pool.execute(
        `SELECT 
            v.id_produto,
            p.sku,
            p.nome_kit,
            v.quantidade,
            v.preco_unitario,
            v.subtotal
         FROM venda v
         JOIN produto p ON v.id_produto = p.id_produto
         WHERE v.id_compra = ?`,
        [idCompra]
    );

    const subtotalProdutos = itens.reduce((acc, item) => acc + Number(item.subtotal), 0);
    const impostos = calcularImpostos(subtotalProdutos);

    return {
        nota_fiscal: {
            id_nota_fiscal: dados.id_nota_fiscal,
            numero_nf: dados.numero_nf,
            serie: dados.serie,
            chave_acesso: dados.chave_acesso,
            chave_acesso_formatada: dados.chave_acesso.replace(/(\d{4})(?=\d)/g, '$1 '),
            data_emissao: dados.data_emissao,
            xml_url: dados.xml_url
        },
        emitente: {
            razao_social: 'EduScience Soluções Educacionais LTDA',
            cnpj: '12.345.678/0001-99',
            inscricao_estadual: '110.042.490.114',
            uf: 'SP'
        },
        destinatario: {
            id_cliente: dados.id_cliente,
            nome_escola: dados.nome_escola,
            cnpj_cpf: dados.cnpj_cpf,
            email: dados.email,
            telefone: dados.telefone,
            endereco: dados.logradouro ? {
                logradouro: dados.logradouro,
                numero: dados.numero,
                complemento: dados.complemento,
                bairro: dados.bairro,
                cidade: dados.cidade,
                estado: dados.estado,
                cep: dados.cep
            } : null
        },
        pedido: {
            id_compra: dados.id_compra,
            data_compra: dados.data_compra,
            status_pedido: dados.status_pedido,
            metodo_pagamento: dados.metodo_pagamento,
            subtotal_produtos: Number(subtotalProdutos.toFixed(2)),
            valor_frete: Number(dados.valor_frete),
            valor_total: Number(dados.valor_total)
        },
        tributos: impostos,
        itens: itens.map((item) => ({
            ...item,
            preco_unitario: Number(item.preco_unitario),
            subtotal: Number(item.subtotal)
        }))
    };
}