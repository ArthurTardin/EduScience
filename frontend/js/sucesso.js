const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = '@EduScience:token';
const STORAGE_ULTIMO_PEDIDO = 'eduscience_ultimo_pedido';

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarData = (iso) => {
  if (!iso) return new Date().toLocaleString('pt-BR');
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? String(iso) : data.toLocaleString('pt-BR');
};

function mostrarEstado(estado) {
  const carregando = document.getElementById('estado-carregando');
  const erro = document.getElementById('estado-erro');
  const comprovante = document.getElementById('comprovante');

  if (carregando) carregando.hidden = estado !== 'carregando';
  if (erro) erro.hidden = estado !== 'erro';
  if (comprovante) comprovante.hidden = estado !== 'comprovante';
}

function exibirErro(mensagem) {
  const erroMsg = document.getElementById('erro-mensagem');
  if (erroMsg) erroMsg.textContent = mensagem;
  mostrarEstado('erro');
}

function renderizarComprovante(dados) {
  const pedido = dados.pedido || dados;
  const nf = dados.nota_fiscal || dados.notaFiscal || dados;
  const itens = nf.itens || pedido.itens || dados.itens || [];

  const setText = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  };

  setText('destinatario-info', nf.destinatario || pedido.nome_escola || 'Instituição de Ensino');
  setText('pedido-numero', `#${pedido.id_compra || pedido.id || '-'}`);
  setText('nf-numero', nf.numero_nf || '-');
  setText('nf-data', formatarData(nf.data_emissao || pedido.data_pedido));
  setText('pagamento', pedido.metodo_pagamento || '-');

  const chave = nf.chave_acesso || nf.chave;
  const linhaChave = document.getElementById('linha-chave');
  if (chave && linhaChave) {
    setText('nf-chave', chave);
    linhaChave.hidden = false;
  }

  const tbody = document.getElementById('itens-body');
  if (tbody) {
    tbody.replaceChildren();
    itens.forEach((item) => {
      const qtd = Number(item.quantidade) || 1;
      const unit = Number(item.preco_unitario ?? item.preco ?? 0);
      const sub = Number(item.subtotal ?? unit * qtd);

      const tr = document.createElement('tr');

      const tdNome = document.createElement('td');
      tdNome.textContent = item.nome_kit || item.nome || 'Kit Didático';

      const tdQtd = document.createElement('td');
      tdQtd.className = 'num';
      tdQtd.textContent = String(qtd);

      const tdUnit = document.createElement('td');
      tdUnit.className = 'num';
      tdUnit.textContent = formatarMoeda(unit);

      const tdSub = document.createElement('td');
      tdSub.className = 'num';
      tdSub.textContent = formatarMoeda(sub);

      tr.append(tdNome, tdQtd, tdUnit, tdSub);
      tbody.appendChild(tr);
    });
  }

  const subtotal = Number(nf.valor_produtos ?? pedido.valor_produtos ?? 0);
  const frete = Number(nf.valor_frete ?? pedido.valor_frete ?? 0);
  const icms = Number(nf.valor_icms ?? subtotal * 0.18);
  const pis = Number(nf.valor_pis ?? subtotal * 0.0165);
  const cofins = Number(nf.valor_cofins ?? subtotal * 0.076);
  const tributos = Number(nf.valor_total_tributos ?? icms + pis + cofins);
  const total = Number(nf.valor_total ?? pedido.valor_total ?? subtotal + frete);

  setText('resumo-subtotal', formatarMoeda(subtotal));
  setText('resumo-frete', frete === 0 ? 'Grátis (R$ 0,00)' : formatarMoeda(frete));
  setText('resumo-icms', formatarMoeda(icms));
  setText('resumo-pis', formatarMoeda(pis));
  setText('resumo-cofins', formatarMoeda(cofins));
  setText('resumo-tributos', formatarMoeda(tributos));
  setText('resumo-total', formatarMoeda(total));

  mostrarEstado('comprovante');
}

async function carregarComprovante() {
  mostrarEstado('carregando');

  const params = new URLSearchParams(window.location.search);
  const idPedido = params.get('pedido');
  const token = localStorage.getItem(TOKEN_KEY);

  let dadosCache = null;
  try {
    const raw = sessionStorage.getItem(STORAGE_ULTIMO_PEDIDO);
    if (raw) dadosCache = JSON.parse(raw);
  } catch {
    dadosCache = null;
  }

  if (idPedido && token) {
    try {
      const response = await fetch(`${API_BASE_URL}/pedidos/${encodeURIComponent(idPedido)}/nota-fiscal`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = 'login.html';
        return;
      }

      if (response.ok) {
        const dadosApi = await response.json();
        renderizarComprovante(dadosApi);
        return;
      }
    } catch {
    }
  }

  if (dadosCache) {
    renderizarComprovante(dadosCache);
    return;
  }

  exibirErro('Pedido não encontrado ou sessão expirada. Verifique seus pedidos após fazer login.');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-imprimir')?.addEventListener('click', () => window.print());
  document.getElementById('btn-tentar-novamente')?.addEventListener('click', carregarComprovante);
  carregarComprovante();
});