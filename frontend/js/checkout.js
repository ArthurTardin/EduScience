import { primeiroCampoInvalido } from './validacao.js';

const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = '@EduScience:token';

let itensCarrinho = [];
let subtotalProdutos = 0;
let valorFreteAtual = 0;

const form = document.getElementById('checkout-form');
const alertBox = document.getElementById('feedback-alert');
const btnFinalizar = document.getElementById('btn-finalizar');
const estadoSelect = document.getElementById('estado');

function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function exibirAlerta(mensagem, tipo = 'error') {
    alertBox.textContent = mensagem;
    alertBox.className = `alert ${tipo}`;
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function limparAlerta() {
    alertBox.className = 'alert';
    alertBox.textContent = '';
}

function obterToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }
    return token;
}

function calcularFrete() {
    const uf = estadoSelect.value;
    if (uf === 'SP') {
        valorFreteAtual = subtotalProdutos >= 500 ? 0 : 15.0;
    } else if (['RJ', 'MG', 'PR'].includes(uf)) {
        valorFreteAtual = 35.0;
    } else {
        valorFreteAtual = 55.0;
    }

    document.getElementById('resumo-frete').textContent =
        valorFreteAtual === 0 ? 'Grátis (R$ 0,00)' : formatarMoeda(valorFreteAtual);
    document.getElementById('resumo-total').textContent =
        formatarMoeda(subtotalProdutos + valorFreteAtual);
}

async function carregarResumoCarrinho() {
    const token = obterToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/carrinho`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();
        itensCarrinho = data.itens || data || [];

        const containerItens = document.getElementById('resumo-itens');
        containerItens.replaceChildren();

        if (!Array.isArray(itensCarrinho) || itensCarrinho.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'field-error';
            emptyMsg.textContent = 'Seu carrinho está vazio.';
            containerItens.appendChild(emptyMsg);
            btnFinalizar.disabled = true;
            return;
        }

        subtotalProdutos = 0;
        itensCarrinho.forEach((item) => {
            const preco = Number(item.preco || item.preco_unitario || 0);
            const qtd = Number(item.quantidade || 1);
            const sub = preco * qtd;
            subtotalProdutos += sub;

            const row = document.createElement('div');
            row.className = 'summary-item';

            const nomeSpan = document.createElement('span');
            nomeSpan.textContent = `${qtd}x ${item.nome_kit}`;

            const precoStrong = document.createElement('strong');
            precoStrong.textContent = formatarMoeda(sub);

            row.append(nomeSpan, precoStrong);
            containerItens.appendChild(row);
        });

        document.getElementById('resumo-subtotal').textContent = formatarMoeda(subtotalProdutos);
        calcularFrete();
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        exibirAlerta('Não foi possível carregar os itens do carrinho. Verifique a conexão com o servidor.');
        btnFinalizar.disabled = true;
    }
}

function configurarInteracoesFormulario() {
    estadoSelect.addEventListener('change', calcularFrete);

    document.querySelectorAll('input[name="metodo_pagamento"]').forEach((radio) => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.payment-option').forEach((opt) => {
                opt.classList.toggle('active', opt.contains(radio));
            });

            ['PIX', 'Cartao', 'Boleto'].forEach((m) => {
                document.getElementById(`details-${m}`).classList.toggle('hidden', m !== radio.value);
            });
        });
    });
}

function validarFormulario() {
    limparAlerta();

    const invalido = primeiroCampoInvalido(form);
    if (invalido) {
        exibirAlerta('Corrija os campos destacados antes de continuar.');
        invalido.focus();
        return false;
    }
    return true;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = obterToken();
    if (!token) return;

    const metodoPagamento = document.querySelector('input[name="metodo_pagamento"]:checked').value;

    if (!validarFormulario()) {
        return;
    }

    btnFinalizar.disabled = true;
    btnFinalizar.textContent = 'Processando pedido e emitindo NF-e...';

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                metodo_pagamento: metodoPagamento,
                valor_frete: valorFreteAtual
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao finalizar o pedido.');
        }

        localStorage.removeItem('eduscience_cart');
        sessionStorage.setItem('eduscience_ultimo_pedido', JSON.stringify(data));

        exibirAlerta(
            `Pedido #${data.pedido.id_compra} confirmado! Nota Fiscal ${data.nota_fiscal.numero_nf} emitida.`,
            'success'
        );

        setTimeout(() => {
            window.location.href = `sucesso.html?pedido=${data.pedido.id_compra}`;
        }, 1500);
    } catch (error) {
        console.error('Erro no checkout:', error);
        exibirAlerta(error.message);
        btnFinalizar.disabled = false;
        btnFinalizar.textContent = 'Confirmar Pedido e Emitir NF-e';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    configurarInteracoesFormulario();
    carregarResumoCarrinho();
});