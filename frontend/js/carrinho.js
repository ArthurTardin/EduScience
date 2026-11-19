const API_BASE_URL = 'http://localhost:3000/api';
const CART_STORAGE_KEY = 'eduscience_cart';
const TOKEN_KEY = '@EduScience:token';

function escaparHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', () => {
  carregarCarrinho();
});

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn || !btn.dataset.action) return;

  const idProduto = Number(btn.dataset.id);
  const idCarrinho = btn.dataset.carrinhoId ? Number(btn.dataset.carrinhoId) : null;
  const action = btn.dataset.action;

  if (action === 'increase') {
    await processarAlteracao(idProduto, idCarrinho, 1);
  } else if (action === 'decrease') {
    await processarAlteracao(idProduto, idCarrinho, -1);
  } else if (action === 'remove') {
    await processarRemocao(idProduto, idCarrinho);
  }
});

async function carregarCarrinho() {
  const cartTableBody = document.querySelector('.cart-table tbody');
  if (!cartTableBody) return;

  const token = localStorage.getItem(TOKEN_KEY);
  let produtos = [];

  if (token) {
    try {
      const res = await fetch(`${API_BASE_URL}/carrinho`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
      } else if (res.ok) {
        const dadosApi = await res.json();
        const lista = Array.isArray(dadosApi) ? dadosApi : (dadosApi.itens || []);
        produtos = lista.map((item) => ({
          id: Number(item.id_produto),
          idCarrinho: Number(item.id_carrinho),
          nome: item.nome_kit || item.nome || 'Produto',
          descricao: item.descricao || '',
          preco: Number(item.preco_unitario ?? item.preco ?? 0),
          quantidade: Number(item.quantidade) || 1,
          categoriaClass: item.categoriaClass || 'placeholder-chem'
        }));
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(produtos));
      }
    } catch {
    }
  }

  if (produtos.length === 0) {
    try {
      produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
      produtos = [];
    }
  }

  if (produtos.length === 0) {
    cartTableBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="cart-empty-container">
            <p>Seu carrinho está vazio no momento.</p>
            <a href="landing.html" class="btn btn-primary">Explorar Kits de Ciência</a>
          </div>
        </td>
      </tr>
    `;
    atualizarTotais(0, 0);
    return;
  }

  cartTableBody.innerHTML = '';
  let valorTotalGeral = 0;
  let totalItens = 0;

  produtos.forEach((produto) => {
    const preco = Number(produto.preco) || 0;
    const qtd = Number(produto.quantidade) || 1;
    const subtotal = preco * qtd;

    valorTotalGeral += subtotal;
    totalItens += qtd;

    const tr = document.createElement('tr');
    tr.classList.add('cart-row');
    tr.innerHTML = `
      <td data-label="Produto">
        <div class="product-info">
          <div class="product-thumb ${escaparHtml(produto.categoriaClass || 'placeholder-chem')}"></div>
          <div>
            <p class="product-name">${escaparHtml(produto.nome || 'Produto')}</p>
            <p class="product-desc">${escaparHtml(produto.descricao || '')}</p>
          </div>
        </div>
      </td>
      <td data-label="Preço">R$ ${preco.toFixed(2).replace('.', ',')}</td>
      <td data-label="Quantidade">
        <div class="qty-control">
          <button type="button" class="qty-btn" data-action="decrease" data-id="${produto.id}" data-carrinho-id="${produto.idCarrinho || ''}">-</button>
          <input type="number" class="qty-input" value="${qtd}" readonly />
          <button type="button" class="qty-btn" data-action="increase" data-id="${produto.id}" data-carrinho-id="${produto.idCarrinho || ''}">+</button>
        </div>
      </td>
      <td data-label="Subtotal" class="item-subtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
      <td class="cell-remove">
        <button type="button" class="btn-remove" data-action="remove" data-id="${produto.id}" data-carrinho-id="${produto.idCarrinho || ''}">Remover</button>
      </td>
    `;
    cartTableBody.appendChild(tr);
  });

  atualizarTotais(valorTotalGeral, totalItens);
}

function atualizarTotais(totalValor, totalItens) {
  const cartCountEl = document.querySelector('.cart-count');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');

  if (cartCountEl) cartCountEl.textContent = `(${totalItens} ${totalItens === 1 ? 'item' : 'itens'})`;
  if (subtotalEl) subtotalEl.textContent = `R$ ${totalValor.toFixed(2).replace('.', ',')}`;
  if (totalEl) totalEl.textContent = `R$ ${totalValor.toFixed(2).replace('.', ',')}`;
}

async function processarAlteracao(idProduto, idCarrinho, delta) {
  let produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  const item = produtos.find((p) => Number(p.id) === idProduto);
  if (!item) return;

  const novaQuantidade = item.quantidade + delta;
  const token = localStorage.getItem(TOKEN_KEY);
  const alvoId = idCarrinho || item.idCarrinho;

  if (token && alvoId) {
    try {
      const endpoint = novaQuantidade <= 0
        ? `${API_BASE_URL}/carrinho/remover/${alvoId}`
        : `${API_BASE_URL}/carrinho/atualizar/${alvoId}`;

      const response = await fetch(endpoint, {
        method: novaQuantidade <= 0 ? 'DELETE' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: novaQuantidade <= 0 ? undefined : JSON.stringify({ quantidade: novaQuantidade })
      });

      if (!response.ok) {
        exibirToast('Não foi possível sincronizar as alterações com o servidor.', 'error');
      }
    } catch {
      exibirToast('Servidor offline. Suas alterações foram salvas apenas localmente.', 'error');
    }
  }

  if (novaQuantidade <= 0) {
    produtos = produtos.filter((p) => Number(p.id) !== idProduto);
  } else {
    item.quantidade = novaQuantidade;
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(produtos));
  await carregarCarrinho();
}

async function processarRemocao(idProduto, idCarrinho) {
  let produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  const item = produtos.find((p) => Number(p.id) === idProduto);
  const token = localStorage.getItem(TOKEN_KEY);
  const alvoId = idCarrinho || item?.idCarrinho;

  if (token && alvoId) {
    try {
      const response = await fetch(`${API_BASE_URL}/carrinho/remover/${alvoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        exibirToast('Erro ao remover o item no servidor.', 'error');
      }
    } catch {
      exibirToast('Servidor offline. Item removido apenas localmente.', 'error');
    }
  }

  produtos = produtos.filter((p) => Number(p.id) !== idProduto);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(produtos));
  await carregarCarrinho();
}

function exibirToast(mensagem, tipo = 'error') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.classList.add('toast', `toast-${tipo}`);
  toast.textContent = mensagem;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}