const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = '@EduScience:token';

let itensCarrinho = [];
let subtotalProdutos = 0;
let valorFreteAtual = 0;

const form = document.getElementById('checkout-form');
const alertBox = document.getElementById('feedback-alert');
const btnFinalizar = document.getElementById('btn-finalizar');
const estadoSelect = document.getElementById('estado');
const cepInput = document.getElementById('cep');

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

        if (!Array.isArray(itensCarrinho) || itensCarrinho.length === 0) {
            containerItens.innerHTML = '<p style="color: #dc2626;">Seu carrinho está vazio.</p>';
            btnFinalizar.disabled = true;
            return;
        }

        subtotalProdutos = 0;
        containerItens.innerHTML = itensCarrinho
            .map((item) => {
                const preco = Number(item.preco || item.preco_unitario || 0);
                const qtd = Number(item.quantidade || 1);
                const sub = preco * qtd;
                subtotalProdutos += sub;

                return `
                    <div class="summary-item">
                        <span>${qtd}x ${item.nome_kit}</span>
                        <strong>${formatarMoeda(sub)}</strong>
                    </div>
                `;
            })
            .join('');

        document.getElementById('resumo-subtotal').textContent = formatarMoeda(subtotalProdutos);
        calcularFrete();
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        exibirAlerta('Não foi possível carregar os itens do carrinho. Verifique a conexão com o servidor.');
        btnFinalizar.disabled = true;
    }
}

function configurarInteracoesFormulario() {
    cepInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5)}`;
        e.target.value = v;
    });

    const cardNum = document.getElementById('cartao-numero');
    cardNum.addEventListener('input', (e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 16);
        e.target.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    });

    const cardVal = document.getElementById('cartao-validade');
    cardVal.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
        e.target.value = v;
    });

    estadoSelect.addEventListener('change', calcularFrete);

    const options = document.querySelectorAll('.payment-option');
    options.forEach((opt) => {
        opt.addEventListener('click', () => {
            options.forEach((o) => o.classList.remove('active'));
            opt.classList.add('active');
            const radio = opt.querySelector('input[type="radio"]');
            radio.checked = true;

            const metodo = radio.value;
            ['PIX', 'Cartao', 'Boleto'].forEach((m) => {
                document.getElementById(`details-${m}`).classList.toggle('hidden', m !== metodo);
            });
        });
    });
}

function validarFormulario(metodoPagamento) {
    limparAlerta();
    document.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));

    const obrigatoriosEntrega = ['cep', 'logradouro', 'numero', 'bairro', 'cidade'];
    for (const id of obrigatoriosEntrega) {
        const campo = document.getElementById(id);
        if (!campo.value.trim()) {
            campo.classList.add('invalid');
            campo.focus();
            exibirAlerta('Preencha todos os campos obrigatórios do endereço de entrega.');
            return false;
        }
    }

    if (!/^\d{5}-\d{3}$/.test(cepInput.value.trim())) {
        cepInput.classList.add('invalid');
        cepInput.focus();
        exibirAlerta('Informe um CEP válido no formato 00000-000.');
        return false;
    }

    if (metodoPagamento === 'Cartao') {
        const numero = document.getElementById('cartao-numero');
        const titular = document.getElementById('cartao-titular');
        const validade = document.getElementById('cartao-validade');
        const cvv = document.getElementById('cartao-cvv');

        if (numero.value.replace(/\D/g, '').length < 13) {
            numero.classList.add('invalid');
            numero.focus();
            exibirAlerta('Número do cartão inválido.');
            return false;
        }

        if (titular.value.trim().length < 3) {
            titular.classList.add('invalid');
            titular.focus();
            exibirAlerta('Informe o nome completo impresso no cartão.');
            return false;
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(validade.value.trim())) {
            validade.classList.add('invalid');
            validade.focus();
            exibirAlerta('Validade do cartão inválida (use MM/AA).');
            return false;
        }

        if (!/^\d{3,4}$/.test(cvv.value.trim())) {
            cvv.classList.add('invalid');
            cvv.focus();
            exibirAlerta('CVV inválido (3 ou 4 dígitos).');
            return false;
        }
    }

    return true;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = obterToken();
    if (!token) return;

    const metodoPagamento = document.querySelector('input[name="metodo_pagamento"]:checked').value;

    if (!validarFormulario(metodoPagamento)) {
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
            window.location.href = `confirmacao.html?pedido=${data.pedido.id_compra}`;
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