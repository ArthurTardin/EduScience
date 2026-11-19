const API_BASE_URL = 'http://localhost:3000/api';
const CART_STORAGE_KEY = 'eduscience_cart';
const TOKEN_KEY = '@EduScience:token';

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function obterCarrinhoLocal() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function salvarCarrinhoLocal(itens) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(itens));
  atualizarContadores(itens);
}

function atualizarContadores(itens) {
  const totalQtd = itens.reduce((acc, item) => acc + (Number(item.quantidade) || 1), 0);
  const navCount = document.querySelector('.nav-cart-count');
  const headerCount = document.querySelector('.cart-count');

  if (navCount) navCount.textContent = String(totalQtd);
  if (headerCount) {
    headerCount.textContent = totalQtd === 1 ? '(1 item)' : `(${totalQtd} itens)`;
  }
}

function exibirToast(mensagem, tipo = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.setAttribute('role', 'status');
  toast.textContent = mensagem;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 2500);
}

async function sincronizarApi(endpoint, method, body = null) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: body ? JSON.stringify(body) : null
    });
  } catch {
  }
}

function renderizarCarrinho() {
  const tbody = document.getElementById('cart-items-body') || document.querySelector('.cart-table tbody');
  const tableWrapper = document.querySelector('.cart-table');
  const emptyContainer = document.querySelector('.cart-empty-container');
  const btnFinalizar = document.getElementById('btn-finalizar');
  const subtotalEl = document.getElementById('summary-subtotal');
  const totalEl = document.getElementById('summary-total');

  const itens = obterCarrinhoLocal();
  atualizarContadores(itens);

  if (!tbody) return;
  tbody.replaceChildren();

  if (itens.length === 0) {
    if (tableWrapper) tableWrapper.hidden = true;
    if (emptyContainer) emptyContainer.hidden = false;
    if (btnFinalizar) btnFinalizar.disabled = true;
    if (subtotalEl) subtotalEl.textContent = formatarMoeda(0);
    if (totalEl) totalEl.textContent = formatarMoeda(0);
    return;
  }

  if (tableWrapper) tableWrapper.hidden = false;
  if (emptyContainer) emptyContainer.hidden = true;
  if (btnFinalizar) btnFinalizar.disabled = false;

  let totalGeral = 0;

  itens.forEach((item) => {
    const qtd = Number(item.quantidade) || 1;
    const preco = Number(item.preco) || 0;
    const subtotal = preco * qtd;
    totalGeral += subtotal;

    const tr = document.createElement('tr');
    tr.className = 'cart-row';

    const tdProduto = document.createElement('td');
    tdProduto.dataset.label = 'Produto';
    const info = document.createElement('div');
    info.className = 'product-info';

    const thumb = document.createElement('div');
    thumb.className = `product-thumb ${item.categoriaClass || 'placeholder-chem'}`;
    thumb.setAttribute('aria-hidden', 'true');

    const textos = document.createElement('div');
    const nome = document.createElement('div');
    nome.className = 'product-name';
    nome.textContent = item.nome;

    const desc = document.createElement('div');
    desc.className = 'product-desc';
    desc.textContent = item.descricao || '';

    textos.append(nome, desc);
    info.append(thumb, textos);
    tdProduto.appendChild(info);

    const tdPreco = document.createElement('td');
    tdPreco.dataset.label = 'Preço';
    tdPreco.textContent = formatarMoeda(preco);

    const tdQtd = document.createElement('td');
    tdQtd.dataset.label = 'Quantidade';
    const controle = document.createElement('div');
    controle.className = 'qty-control';
    controle.setAttribute('role', 'group');
    controle.setAttribute('aria-label', `Quantidade de ${item.nome}`);

    const btnMenos = document.createElement('button');
    btnMenos.type = 'button';
    btnMenos.className = 'qty-btn';
    btnMenos.textContent = '−';
    btnMenos.setAttribute('aria-label', `Diminuir quantidade de ${item.nome}`);
    btnMenos.addEventListener('click', () => alterarQuantidade(item.id, qtd - 1));

    const inputQtd = document.createElement('input');
    inputQtd.type = 'number';
    inputQtd.className = 'qty-input';
    inputQtd.min = '1';
    inputQtd.value = String(qtd);
    inputQtd.setAttribute('aria-label', `Quantidade atual de ${item.nome}`);
    inputQtd.addEventListener('change', (e) => {
      const novaQtd = Math.max(1, parseInt(e.target.value, 10) || 1);
      alterarQuantidade(item.id, novaQtd);
    });

    const btnMais = document.createElement('button');
    btnMais.type = 'button';
    btnMais.className = 'qty-btn';
    btnMais.textContent = '+';
    btnMais.setAttribute('aria-label', `Aumentar quantidade de ${item.nome}`);
    btnMais.addEventListener('click', () => alterarQuantidade(item.id, qtd + 1));

    controle.append(btnMenos, inputQtd, btnMais);
    tdQtd.appendChild(controle);

    const tdSub = document.createElement('td');
    tdSub.dataset.label = 'Subtotal';
    tdSub.className = 'item-subtotal';
    tdSub.textContent = formatarMoeda(subtotal);

    const tdRemover = document.createElement('td');
    tdRemover.className = 'cell-remove';
    const btnRemover = document.createElement('button');
    btnRemover.type = 'button';
    btnRemover.className = 'btn-remove';
    btnRemover.textContent = 'Remover';
    btnRemover.setAttribute('aria-label', `Remover ${item.nome} do carrinho`);
    btnRemover.addEventListener('click', () => removerItem(item.id, item.nome));
    tdRemover.appendChild(btnRemover);

    tr.append(tdProduto, tdPreco, tdQtd, tdSub, tdRemover);
    tbody.appendChild(tr);
  });

  if (subtotalEl) subtotalEl.textContent = formatarMoeda(totalGeral);
  if (totalEl) totalEl.textContent = formatarMoeda(totalGeral);
}

async function alterarQuantidade(id, novaQtd) {
  if (novaQtd <= 0) {
    const item = obterCarrinhoLocal().find((p) => Number(p.id) === Number(id));
    await removerItem(id, item?.nome || 'Item');
    return;
  }

  const itens = obterCarrinhoLocal().map((item) =>
    Number(item.id) === Number(id) ? { ...item, quantidade: novaQtd } : item
  );

  salvarCarrinhoLocal(itens);
  renderizarCarrinho();
  await sincronizarApi(`/carrinho/${id}`, 'PUT', { quantidade: novaQtd });
}

async function removerItem(id, nome) {
  const itens = obterCarrinhoLocal().filter((item) => Number(item.id) !== Number(id));
  salvarCarrinhoLocal(itens);
  renderizarCarrinho();
  exibirToast(`${nome} removido do carrinho.`);
  await sincronizarApi(`/carrinho/${id}`, 'DELETE');
}

document.addEventListener('DOMContentLoaded', renderizarCarrinho);