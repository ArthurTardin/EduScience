document.addEventListener("DOMContentLoaded", carregarCarrinho);

const CART_STORAGE_KEY = 'eduscience_cart';

function carregarCarrinho() {
  const cartTableBody = document.querySelector(".cart-table tbody");
  const cartCountEl = document.querySelector(".cart-count");
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");

  let produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

  if (produtos.length === 0) {
    if (cartTableBody) {
      cartTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="cart-empty">
            <p>Seu carrinho está vazio.</p>
            <a href="landing.html" class="btn btn-secondary">Ver Kits Didáticos</a>
          </td>
        </tr>
      `;
    }
    atualizarTotais(0, 0);
    return;
  }

  if (cartTableBody) {
    cartTableBody.innerHTML = "";
    let valorTotalGeral = 0;
    let totalItens = 0;

    produtos.forEach((produto) => {
      const subtotal = produto.preco * produto.quantidade;
      valorTotalGeral += subtotal;
      totalItens += produto.quantidade;

      const tr = document.createElement("tr");
      tr.classList.add("cart-row");
      tr.innerHTML = `
        <td data-label="Produto">
          <div class="product-info">
            <div class="product-thumb ${produto.categoriaClass || 'placeholder-chem'}"></div>
            <div>
              <p class="product-name">${produto.nome}</p>
              <p class="product-desc">${produto.descricao || 'Kit educacional de ciências'}</p>
            </div>
          </div>
        </td>
        <td data-label="Preço">R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}</td>
        <td data-label="Quantidade">
          <div class="qty-control">
            <button type="button" class="qty-btn" onclick="alterarQuantidade(${produto.id}, -1)">-</button>
            <input type="number" class="qty-input" value="${produto.quantidade}" readonly />
            <button type="button" class="qty-btn" onclick="alterarQuantidade(${produto.id}, 1)">+</button>
          </div>
        </td>
        <td data-label="Subtotal" class="item-subtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
        <td class="cell-remove">
          <button type="button" class="btn-remove" onclick="removerItem(${produto.id})">Remover</button>
        </td>
      `;
      cartTableBody.appendChild(tr);
    });

    atualizarTotais(valorTotalGeral, totalItens);
  }
}

function atualizarTotais(totalValor, totalItens) {
  const cartCountEl = document.querySelector(".cart-count");
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");

  if (cartCountEl) cartCountEl.textContent = `(${totalItens} ${totalItens === 1 ? 'item' : 'itens'})`;
  if (subtotalEl) subtotalEl.textContent = `R$ ${totalValor.toFixed(2).replace('.', ',')}`;
  if (totalEl) totalEl.textContent = `R$ ${totalValor.toFixed(2).replace('.', ',')}`;
}

window.alterarQuantidade = function(id, delta) {
  let produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  const item = produtos.find(p => p.id === id);

  if (item) {
    item.quantidade += delta;
    if (item.quantidade <= 0) {
      produtos = produtos.filter(p => p.id !== id);
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(produtos));
    carregarCarrinho();
  }
};

window.removerItem = function(id) {
  let produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  produtos = produtos.filter(p => p.id !== id);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(produtos));
  carregarCarrinho();
};