const CART_STORAGE_KEY = 'eduscience_cart';

document.addEventListener("DOMContentLoaded", () => {
  carregarCarrinho();
});

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn || !btn.dataset.action) return;

  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if (action === "increase") {
    await processarAlteracao(id, 1);
  } else if (action === "decrease") {
    await processarAlteracao(id, -1);
  } else if (action === "remove") {
    await processarRemocao(id);
  }
});

function carregarCarrinho() {
  const cartTableBody = document.querySelector(".cart-table tbody");
  let produtos = [];

  try {
    produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (err) {
    localStorage.removeItem(CART_STORAGE_KEY);
    produtos = [];
  }

  if (!cartTableBody) return;

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

  cartTableBody.innerHTML = "";
  let valorTotalGeral = 0;
  let totalItens = 0;

  produtos.forEach((produto) => {
    const preco = Number(produto.preco) || 0;
    const qtd = Number(produto.quantidade) || 1;
    const subtotal = preco * qtd;

    valorTotalGeral += subtotal;
    totalItens += qtd;

    const tr = document.createElement("tr");
    tr.classList.add("cart-row");
    tr.innerHTML = `
      <td data-label="Produto">
        <div class="product-info">
          <div class="product-thumb ${produto.categoriaClass || 'placeholder-chem'}"></div>
          <div>
            <p class="product-name">${produto.nome || 'Produto'}</p>
            <p class="product-desc">${produto.descricao || ''}</p>
          </div>
        </div>
      </td>
      <td data-label="Preço">R$ ${preco.toFixed(2).replace('.', ',')}</td>
      <td data-label="Quantidade">
        <div class="qty-control">
          <button type="button" class="qty-btn" data-action="decrease" data-id="${produto.id}">-</button>
          <input type="number" class="qty-input" value="${qtd}" readonly />
          <button type="button" class="qty-btn" data-action="increase" data-id="${produto.id}">+</button>
        </div>
      </td>
      <td data-label="Subtotal" class="item-subtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
      <td class="cell-remove">
        <button type="button" class="btn-remove" data-action="remove" data-id="${produto.id}">Remover</button>
      </td>
    `;
    cartTableBody.appendChild(tr);
  });

  atualizarTotais(valorTotalGeral, totalItens);
}

function atualizarTotais(totalValor, totalItens) {
  const cartCountEl = document.querySelector(".cart-count");
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");

  if (cartCountEl) cartCountEl.textContent = `(${totalItens} ${totalItens === 1 ? 'item' : 'itens'})`;
  if (subtotalEl) subtotalEl.textContent = `R$ ${totalValor.toFixed(2).replace('.', ',')}`;
  if (totalEl) totalEl.textContent = `R$ ${totalValor.toFixed(2).replace('.', ',')}`;
}

async function processarAlteracao(id, delta) {
  let produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  const item = produtos.find(p => p.id === id);
  if (!item) return;

  const novaQuantidade = item.quantidade + delta;
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const response = await fetch(`http://localhost:3000/api/carrinho/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantidade: novaQuantidade })
      });

      if (!response.ok) {
        exibirToast("Não foi possível sincronizar as alterações com o servidor.", "error");
      }
    } catch (error) {
      exibirToast("Servidor offline. Suas alterações foram salvas apenas localmente.", "error");
    }
  }

  if (novaQuantidade <= 0) {
    produtos = produtos.filter(p => p.id !== id);
  } else {
    item.quantidade = novaQuantidade;
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(produtos));
  carregarCarrinho();
}

async function processarRemocao(id) {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const response = await fetch(`http://localhost:3000/api/carrinho/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        exibirToast("Erro ao remover o item no servidor.", "error");
      }
    } catch (error) {
      exibirToast("Servidor offline. Item removido apenas localmente.", "error");
    }
  }

  let produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  produtos = produtos.filter(p => p.id !== id);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(produtos));
  carregarCarrinho();
}

function exibirToast(mensagem, tipo = "error") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.classList.add("toast", `toast-${tipo}`);
  toast.textContent = mensagem;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}