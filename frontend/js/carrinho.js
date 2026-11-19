const CART_KEY = "eduscience_cart";
const LEGACY_CART_KEY = "lumolab-cart";

const suggestion = {
  id: 2,
  name: "Kit Eletromagnetismo",
  tag: "Física • 7º e 8º ano",
  meta: "5 experimentos • Para até 30 alunos",
  price: 349.9,
  oldPrice: 379.9,
  quantity: 1,
  art: "yellow"
};

function normalizeItem(raw, index = 0) {
  const preco = Number(raw.preco ?? raw.price ?? 0);
  const quantidade = Math.max(1, Number(raw.quantidade ?? raw.quantity ?? 1));
  const arts = ["coral", "mint", "yellow"];
  return {
    id: raw.id ?? index + 1,
    name: raw.nome ?? raw.name ?? "Kit Científico",
    tag: raw.tag ?? raw.categoria ?? "Ciências • Ensino Fundamental",
    meta: raw.meta ?? "Experimentos práticos • Para até 30 alunos",
    price: preco,
    oldPrice: Number(raw.oldPrice ?? preco * 1.08),
    quantity,
    art: raw.art ?? arts[index % arts.length]
  };
}

function loadInitialCart() {
  try {
    const rawCurrent = window.localStorage.getItem(CART_KEY);
    if (rawCurrent !== null) {
      const parsed = JSON.parse(rawCurrent);
      return Array.isArray(parsed) ? parsed.map((item, i) => normalizeItem(item, i)) : [];
    }

    const rawLegacy = window.localStorage.getItem(LEGACY_CART_KEY);
    if (rawLegacy !== null) {
      const parsedLegacy = JSON.parse(rawLegacy);
      if (Array.isArray(parsedLegacy)) {
        return parsedLegacy.map((item, i) => normalizeItem(item, i));
      }
    }
  } catch {
    // Fallback para carrinho vazio
  }
  return [];
}

let items = loadInitialCart();
let discountRate = 0;
let shipping = Number(document.querySelector('input[name="shipping"]:checked')?.value ?? 0);

const cartItems = document.querySelector("#cart-items");
const emptyState = document.querySelector("#empty-state");
const itemCount = document.querySelector("#item-count");
const subtotalElement = document.querySelector("#subtotal");
const discountElement = document.querySelector("#discount");
const shippingElement = document.querySelector("#shipping-total");
const totalElement = document.querySelector("#total");
const checkoutButton = document.querySelector("#checkout-button");
const checkoutStatus = document.querySelector("#checkout-status");
const addSuggestionButton = document.querySelector("#add-suggestion");
const shippingBanner = document.querySelector("#shipping-banner");
const shippingBannerText = document.querySelector("#shipping-banner-text");

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const artMarkup = (type) => {
  if (type === "coral") {
    return `<svg viewBox="0 0 170 130" aria-hidden="true"><path d="M66 18v39l-29 48c-4 7 1 15 9 15h79c8 0 13-8 9-15l-29-48V18" fill="#fff8df" stroke="#123d3a" stroke-width="4"/><path d="M51 94h68l15 25H37z" fill="#f47b5f"/><path d="M58 18h55" stroke="#123d3a" stroke-width="6" stroke-linecap="round"/><circle cx="77" cy="82" r="5" fill="#efc058"/><circle cx="100" cy="104" r="4" fill="#efc058"/></svg>`;
  }
  if (type === "yellow") {
    return `<svg viewBox="0 0 170 130" aria-hidden="true"><circle cx="85" cy="65" r="35" fill="#fff8df" stroke="#123d3a" stroke-width="4"/><path d="M85 30V14M85 116v-16M50 65H34M136 65h-16M61 41 49 29M121 101l-12-12" stroke="#123d3a" stroke-width="4" stroke-linecap="round"/><path d="m90 37-20 34h17l-6 26 23-37H86z" fill="#efc058" stroke="#123d3a" stroke-width="2"/></svg>`;
  }
  return `<svg viewBox="0 0 170 130" aria-hidden="true"><path d="M85 113V58" stroke="#123d3a" stroke-width="5" stroke-linecap="round"/><path d="M84 67C61 69 44 56 42 36c22-3 39 8 42 31ZM86 82c24 1 41-12 42-32-22-2-39 10-42 32Z" fill="#72aaa0" stroke="#123d3a" stroke-width="3"/><path d="M59 114h52" stroke="#123d3a" stroke-width="5" stroke-linecap="round"/><circle cx="56" cy="72" r="6" fill="#f47b5f"/><circle cx="121" cy="94" r="5" fill="#efc058"/></svg>`;
};

const saveCart = () => {
  try {
    const payload = items.map((item) => ({
      id: item.id,
      nome: item.name,
      name: item.name,
      tag: item.tag,
      meta: item.meta,
      preco: item.price,
      price: item.price,
      oldPrice: item.oldPrice,
      quantidade: item.quantity,
      quantity: item.quantity,
      art: item.art
    }));
    window.localStorage.setItem(CART_KEY, JSON.stringify(payload));
  } catch {
    // Mantém o estado em memória na sessão atual
  }
};

const render = () => {
  if (cartItems) {
    cartItems.innerHTML = items
      .map(
        (item) => `
      <article class="cart-item" data-id="${item.id}">
        <div class="item-art item-art--${item.art}">${artMarkup(item.art)}</div>
        <div class="item-info">
          <span class="item-tag">${item.tag}</span>
          <h2>${item.name}</h2>
          <p class="item-meta">${item.meta}</p>
          <div class="item-actions">
            <div class="quantity" aria-label="Quantidade de ${item.name}">
              <button type="button" data-action="decrease" aria-label="Diminuir quantidade de ${item.name}">−</button>
              <output aria-live="polite">${item.quantity}</output>
              <button type="button" data-action="increase" aria-label="Aumentar quantidade de ${item.name}">+</button>
            </div>
            <button class="remove-button" type="button" data-action="remove">Remover</button>
          </div>
        </div>
        <strong class="item-price">${formatCurrency(item.price * item.quantity)}<small>${formatCurrency(item.oldPrice * item.quantity)}</small></strong>
      </article>
    `
      )
      .join("");
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * discountRate;
  const total = Math.max(0, subtotal - discount + shipping);

  if (shippingBanner && shippingBannerText) {
    shippingBanner.hidden = items.length === 0;
    if (subtotal >= 700) {
      shippingBannerText.innerHTML =
        "<strong>Frete grátis para sua escola!</strong><span>Seu pedido atingiu o patamar de R$ 700,00.</span>";
    } else {
      const falta = Math.max(0, 700 - subtotal);
      shippingBannerText.innerHTML = `<strong>Entrega escolar disponível</strong><span>Adicione mais ${formatCurrency(falta)} para atingir R$ 700,00.</span>`;
    }
  }

  if (itemCount) {
    itemCount.textContent = `${count} ${count === 1 ? "item selecionado" : "itens selecionados"}`;
  }
  if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
  if (discountElement) {
    discountElement.textContent = discount ? `− ${formatCurrency(discount)}` : "—";
    discountElement.classList.toggle("has-discount", discount > 0);
  }
  if (shippingElement) {
    shippingElement.textContent = shipping ? formatCurrency(shipping) : "Grátis";
  }
  if (totalElement) totalElement.textContent = formatCurrency(total);
  if (cartItems) cartItems.hidden = items.length === 0;
  if (emptyState) emptyState.hidden = items.length !== 0;
  if (checkoutButton) checkoutButton.disabled = items.length === 0;

  if (addSuggestionButton) {
    const alreadyInCart = items.some((item) => String(item.id) === String(suggestion.id));
    addSuggestionButton.disabled = alreadyInCart;
    addSuggestionButton.innerHTML = alreadyInCart
      ? "<span>✓</span> Adicionado"
      : "<span>+</span> Adicionar";
  }

  saveCart();
};

cartItems?.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  const itemElement = event.target.closest(".cart-item");
  if (!button || !itemElement) return;

  const item = items.find((entry) => String(entry.id) === String(itemElement.dataset.id));
  if (!item) return;

  if (button.dataset.action === "increase") item.quantity += 1;
  if (button.dataset.action === "decrease") item.quantity = Math.max(1, item.quantity - 1);
  if (button.dataset.action === "remove") {
    items = items.filter((entry) => String(entry.id) !== String(item.id));
  }
  if (checkoutStatus) checkoutStatus.textContent = "";
  render();
});

addSuggestionButton?.addEventListener("click", () => {
  if (!items.some((item) => String(item.id) === String(suggestion.id))) {
    items.push({ ...suggestion });
  }
  render();
});

document.querySelectorAll('input[name="shipping"]').forEach((option) => {
  option.addEventListener("change", () => {
    shipping = Number(option.value);
    render();
  });
});

document.querySelector(".coupon-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#coupon");
  const status = document.querySelector("#coupon-status");
  const code = input?.value.trim().toUpperCase() || "";

  status?.classList.remove("is-success", "is-error");
  if (code === "ESCOLA10") {
    discountRate = 0.1;
    if (status) {
      status.textContent = "Cupom aplicado: 10% de desconto.";
      status.classList.add("is-success");
    }
  } else {
    discountRate = 0;
    if (status) {
      status.textContent = "Cupom não encontrado. Tente ESCOLA10.";
      status.classList.add("is-error");
    }
  }
  render();
});

checkoutButton?.addEventListener("click", () => {
  if (items.length === 0) {
    if (checkoutStatus) checkoutStatus.textContent = "Adicione ao menos um kit antes de avançar.";
    return;
  }
  saveCart();
});

render();