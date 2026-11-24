import { apiFetch } from "./api.js";

const CART_KEY = "eduscience_cart";
const TOKEN_KEY = "@EduScience:token";
const USER_KEY = "@EduScience:user";

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".main-nav");
const cartCountEl = document.querySelector("#cart-count");
const toastEl = document.querySelector("#cart-toast");
const authLink = document.querySelector("#nav-auth-link");

function readCart() {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCounter();
}

function updateCartCounter() {
  if (!cartCountEl) return;
  const items = readCart();
  const total = items.reduce((acc, item) => acc + Number(item.quantidade || item.quantity || 1), 0);
  cartCountEl.textContent = String(total);
}

let toastTimer;
function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}

function addItemToCart({ id, nome, preco }) {
  const numericId = Number(id);
  const numericPrice = Number(String(preco ?? "").replace(",", "."));
  if (!Number.isFinite(numericId) || numericId <= 0 || !Number.isFinite(numericPrice) || numericPrice < 0) {
    return;
  }

  const items = readCart();
  const existing = items.find((item) => Number(item.id ?? item.id_produto ?? item.produtoId) === numericId);

  if (existing) {
    existing.quantidade = Number(existing.quantidade || existing.quantity || 1) + 1;
  } else {
    items.push({
      id: numericId,
      id_produto: numericId,
      nome: nome || `Kit #${numericId}`,
      preco: numericPrice,
      quantidade: 1
    });
  }

  saveCart(items);
  const current = items.find((item) => Number(item.id ?? item.id_produto ?? item.produtoId) === numericId);
  showToast(`${current?.nome || nome} adicionado ao carrinho!`);
}

function initSessionNav() {
  if (!authLink) return;
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  authLink.textContent = "Sair";
  authLink.href = "#sair";
  authLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    window.location.reload();
  });
}

async function syncProductsFromApi() {
  try {
    const response = await apiFetch("/produtos", { auth: false });
    const produtos = Array.isArray(response) ? response : response?.produtos || response?.data;
    if (!Array.isArray(produtos) || produtos.length === 0) return;

    const buttons = document.querySelectorAll(".add-cart-btn");
    buttons.forEach((btn, idx) => {
      const prod = produtos[idx];
      if (!prod) return;

      const resolvedId = prod.id_produto ?? prod.id;
      const resolvedName = prod.nome_kit ?? prod.nome;
      const resolvedPrice = prod.preco;

      if (resolvedId != null && Number.isFinite(Number(resolvedId))) {
        btn.dataset.id = String(resolvedId);
      }
      if (resolvedName) {
        btn.dataset.nome = String(resolvedName);
      }
      if (resolvedPrice != null && Number.isFinite(Number(resolvedPrice))) {
        btn.dataset.preco = String(resolvedPrice);
      }

      const card = btn.closest(".product-copy");
      const titleEl = card?.querySelector("h3");
      const metaEl = card?.querySelector("span");
      if (titleEl && resolvedName) titleEl.textContent = resolvedName;
      if (metaEl && resolvedPrice != null) {
        const precoFmt = Number(resolvedPrice).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        });
        metaEl.textContent = `${prod.estoque ?? 30} em estoque • ${precoFmt}`;
      }
    });
  } catch {
    // Mantém os cards estáticos se a API estiver fora do ar
  }
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  navigation?.classList.toggle("is-open", !isOpen);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Abrir menu");
    navigation.classList.remove("is-open");
  });
});

document.querySelectorAll(".add-cart-btn").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    addItemToCart({
      id: button.dataset.id,
      nome: button.dataset.nome,
      preco: button.dataset.preco
    });
  });
});

const faqItems = document.querySelectorAll(".accordion details");
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

const leadForm = document.querySelector(".lead-form");
const emailInput = document.querySelector("#school-email");
const formStatus = document.querySelector(".form-status");

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!emailInput?.value.trim() || !emailInput.checkValidity()) {
    if (formStatus) formStatus.textContent = "Informe um e-mail escolar válido.";
    emailInput?.focus();
    return;
  }

  try {
    window.localStorage.setItem("eduscience-catalog-email", emailInput.value.trim());
    if (formStatus) formStatus.textContent = "Pronto! Seu interesse foi salvo neste dispositivo.";
  } catch {
    if (formStatus) formStatus.textContent = "E-mail recebido para esta sessão. Obrigado pelo interesse!";
  }

  emailInput.value = "";
});

updateCartCounter();
initSessionNav();
syncProductsFromApi();