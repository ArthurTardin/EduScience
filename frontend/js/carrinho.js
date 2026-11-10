const CART_STORAGE_KEY = 'eduscience_cart';

document.addEventListener("DOMContentLoaded", carregarCarrinho);

function carregarCarrinho() {
  const cartTableBody = document.querySelector(".cart-table tbody");
  let produtos = [];

  try {
    produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (err) {
    console.error("Erro ao ler localStorage, reiniciando carrinho:", err);
    localStorage.removeItem(CART_STORAGE_KEY);
    produtos = [];
  }

  if (!cartTableBody) return;

  if (produtos.length === 0) {
    cartTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="cart-empty">
          <p>Seu carrinho está vazio.</p>
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
          <button type="button" class="qty-btn" onclick="window.alterarQuantidade(${produto.id}, -1)">-</button>
          <input type="number" class="qty-input" value="${qtd}" readonly />
          <button type="button" class="qty-btn" onclick="window.alterarQuantidade(${produto.id}, 1)">+</button>
        </div>
      </td>
      <td data-label="Subtotal" class="item-subtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
      <td class="cell-remove">
        <button type="button" class="btn-remove" onclick="window.removerItem(${produto.id})">Remover</button>
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

window.alterarQuantidade = async function(id, delta) {
  let produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  const item = produtos.find(p => p.id === id);
  if (!item) return;

  const novaQuantidade = item.quantidade + delta;
  const token = localStorage.getItem("token");

  if (token) {
    try {
      await fetch(`http://localhost:3000/api/carrinho/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantidade: novaQuantidade })
      });
    } catch (error) {
      console.log("Tentativa de envio HTTP para API realizada.");
    }
  }

  if (novaQuantidade <= 0) {
    produtos = produtos.filter(p => p.id !== id);
  } else {
    item.quantidade = novaQuantidade;
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(produtos));
  carregarCarrinho();
};

window.removerItem = async function(id) {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      await fetch(`http://localhost:3000/api/carrinho/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
    } catch (error) {
      console.log("Tentativa de remoção HTTP para API realizada.");
    }
  }

  let produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  produtos = produtos.filter(p => p.id !== id);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(produtos));
  carregarCarrinho();
};