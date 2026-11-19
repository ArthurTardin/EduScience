import { apiFetch } from "./api.js";
import { primeiroCampoInvalido, exibirErroInline } from "./validacao.js";

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
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCounter();
}

function updateCartCounter() {
  if (!cartCountEl) return;
  const items = readCart();
  const total = items.reduce((acc, item) => acc + Number(item.quantidade || 1), 0);
  cartCountEl.textContent = String(total);
}

let toastTimer;
function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}

function addItemToCart({ id, nome, preco }) {
  const items = readCart();
  const numericId = Number(id);
  const existing = items.find((item) => Number(item.id) === numericId);

  if (existing) {
    existing.quantidade = Number(existing.quantidade || 1) + 1;
  } else {
    items.push({
      id: numericId,
      nome,
      preco: Number(preco),
      quantidade: 1
    });
  }

  saveCart(items);
  showToast(`${nome} adicionado ao carrinho!`);
}

function initSessionNav() {
  if (!authLink) return;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  authLink.textContent = "Sair";
  authLink.href = "#sair";
  authLink.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
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
      btn.dataset.id = String(prod.id);
      btn.dataset.nome = prod.nome || btn.dataset.nome;
      btn.dataset.preco = String(prod.preco ?? btn.dataset.preco);

      const card = btn.closest(".product-copy");
      const titleEl = card?.querySelector("h3");
      const metaEl = card?.querySelector("span");
      if (titleEl && prod.nome) titleEl.textContent = prod.nome;
      if (metaEl && prod.preco != null) {
        const precoFmt = Number(prod.preco).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        });
        metaEl.textContent = `${prod.estoque ?? 30} em estoque • ${precoFmt}`;
      }
    });
  } catch {
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
  button.addEventListener("click", () => {
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
  const invalido = primeiroCampoInvalido(leadForm);
  if (invalido) {
    invalido.focus();
    return;
  }

  try {
    window.localStorage.setItem("eduscience-catalog-email", emailInput.value);
    if (formStatus) formStatus.textContent = "Pronto! Seu interesse foi salvo neste dispositivo.";
    exibirErroInline(emailInput, "");
  } catch {
    if (formStatus) formStatus.textContent = "E-mail recebido para esta sessão. Obrigado pelo interesse!";
  }

  function addItemToCart({ id, nome, preco }) {
  const numericId = Number(id);
  const numericPrice = Number(String(preco ?? 0).replace(",", "."));
  if (!Number.isFinite(numericId) || !Number.isFinite(numericPrice)) return;

  const items = readCart();
  const existing = items.find((item) => Number(item.id) === numericId);

  if (existing) {
    existing.quantidade = Number(existing.quantidade || 1) + 1;
  } else {
    items.push({
      id: numericId,
      nome: nome || `Kit #${numericId}`,
      preco: numericPrice,
      quantidade: 1
    });
  }

  saveCart(items);
  showToast(`${items.find((i) => Number(i.id) === numericId)?.nome || nome} adicionado ao carrinho!`);
}

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

  emailInput.value = "";
});

updateCartCounter();
initSessionNav();
syncProductsFromApi();