import { apiFetch } from "./api.js";
import { primeiroCampoInvalido, exibirErroInline } from "./validacao.js";

const CART_KEY = "eduscience_cart";
const LEGACY_CART_KEY = "lumolab-cart";
const TOKEN_KEY = "@EduScience:token";
const LAST_ORDER_KEY = "@EduScience:last_order";

const defaultItems = [
  {
    id: 1,
    name: "Kit Química Analítica",
    meta: "Química • 8º e 9º ano",
    price: 289.9,
    quantity: 1,
    art: "coral"
  },
  {
    id: 3,
    name: "Kit Óptica e Ondas",
    meta: "Óptica • 6º e 7º ano",
    price: 219.9,
    quantity: 1,
    art: "mint"
  }
];

function normalizeItem(raw, index = 0) {
  const arts = ["coral", "mint", "yellow"];
  return {
    id: Number(raw.id) || index + 1,
    name: raw.nome ?? raw.name ?? "Kit Científico",
    meta: raw.meta ?? raw.tag ?? "Ciências • Ensino Fundamental",
    price: Number(raw.preco ?? raw.price ?? 0),
    quantity: Math.max(1, Number(raw.quantidade ?? raw.quantity ?? 1)),
    art: raw.art ?? arts[index % arts.length]
  };
}

function loadCartItems() {
  try {
    const rawCurrent = window.localStorage.getItem(CART_KEY);
    if (rawCurrent !== null) {
      const parsed = JSON.parse(rawCurrent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, i) => normalizeItem(item, i));
      }
    }

    const rawLegacy = window.localStorage.getItem(LEGACY_CART_KEY);
    if (rawLegacy !== null) {
      const parsedLegacy = JSON.parse(rawLegacy);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        return parsedLegacy.map((item, i) => normalizeItem(item, i));
      }
    }
  } catch {
    // Fallback para itens padrão
  }
  return defaultItems;
}

let items = loadCartItems();
let shipping = Number(document.querySelector('input[name="shipping"]:checked')?.value ?? 0);
let payment = document.querySelector('input[name="payment"]:checked')?.value || "card";

const form = document.querySelector("#checkout-form");
const summaryItems = document.querySelector("#summary-items");
const subtotalElement = document.querySelector("#subtotal");
const shippingElement = document.querySelector("#shipping-total");
const totalElement = document.querySelector("#total");
const discountRow = document.querySelector("#discount-row");
const discountElement = document.querySelector("#discount");
const installments = document.querySelector("#installments");
const formStatus = document.querySelector("#form-status");
const cardFields = document.querySelector("#card-fields");
const pixPanel = document.querySelector("#pix-panel");
const invoicePanel = document.querySelector("#invoice-panel");
const submitButton = document.querySelector("#submit-order-button");
const cardInputs = cardFields ? cardFields.querySelectorAll("input") : [];

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const onlyDigits = (value, limit) => String(value || "").replace(/\D/g, "").slice(0, limit);

const artMarkup = (type) => {
  if (type === "coral") {
    return `<svg viewBox="0 0 70 60" aria-hidden="true"><path d="M27 7v18L15 48c-2 4 1 7 5 7h31c4 0 7-3 5-7L44 25V7" fill="#fff8df" stroke="#123d3a" stroke-width="2.4"/><path d="M21 43h28l7 12H15z" fill="#f47b5f"/><path d="M24 7h23" stroke="#123d3a" stroke-width="3.5" stroke-linecap="round"/></svg>`;
  }
  if (type === "yellow") {
    return `<svg viewBox="0 0 70 60" aria-hidden="true"><circle cx="35" cy="30" r="17" fill="#fff8df" stroke="#123d3a" stroke-width="2.5"/><path d="m38 16-10 17h8l-3 13 12-19h-9z" fill="#efc058" stroke="#123d3a" stroke-width="1.5"/></svg>`;
  }
  return `<svg viewBox="0 0 70 60" aria-hidden="true"><path d="M35 54V27" stroke="#123d3a" stroke-width="2.7"/><path d="M35 32C24 33 17 27 16 18c10-1 18 4 19 14ZM36 39c11 1 19-5 20-15-11-1-18 5-20 15Z" fill="#72aaa0" stroke="#123d3a" stroke-width="1.8"/><path d="M24 54h22" stroke="#123d3a" stroke-width="2.7" stroke-linecap="round"/></svg>`;
};

const renderSummary = () => {
  if (summaryItems) {
    summaryItems.innerHTML = items
      .map(
        (item) => `
      <article class="summary-item">
        <div class="summary-art summary-art--${item.art || "mint"}">
          ${artMarkup(item.art)}<span class="item-count">${item.quantity}</span>
        </div>
        <div><h3>${item.name}</h3><span>${item.meta || "Kit científico"}</span></div>
        <strong>${formatCurrency(item.price * item.quantity)}</strong>
      </article>
    `
      )
      .join("");
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = payment === "pix" ? subtotal * 0.05 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
  if (shippingElement) {
    shippingElement.textContent = shipping ? formatCurrency(shipping) : "Grátis";
    shippingElement.classList.toggle("free", shipping === 0);
  }
  if (discountRow) discountRow.hidden = discount === 0;
  if (discountElement) discountElement.textContent = `− ${formatCurrency(discount)}`;
  if (totalElement) totalElement.textContent = formatCurrency(total);

  if (installments) {
    const installmentValues = [1, 2, 3];
    installments.innerHTML = installmentValues
      .map(
        (parts) =>
          `<option value="${parts}">${parts}x de ${formatCurrency(total / parts)} sem juros</option>`
      )
      .join("");
  }
};

document.querySelectorAll('input[name="shipping"]').forEach((input) => {
  input.addEventListener("change", () => {
    shipping = Number(input.value);
    renderSummary();
  });
});

document.querySelectorAll('input[name="payment"]').forEach((input) => {
  input.addEventListener("change", () => {
    payment = input.value;
    if (cardFields) cardFields.hidden = payment !== "card";
    if (pixPanel) pixPanel.hidden = payment !== "pix";
    if (invoicePanel) invoicePanel.hidden = payment !== "invoice";
    cardInputs.forEach((field) => {
      field.required = payment === "card";
      if (payment !== "card") exibirErroInline(field, "");
    });
    renderSummary();
  });
});

const personTypeInputs = document.querySelectorAll('input[name="person-type"]');
const documentInput = document.querySelector("#document");
const documentLabel = document.querySelector("#document-label");
const schoolName = document.querySelector("#school-name");

personTypeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const isSchool = input.value === "school";
    if (documentLabel) documentLabel.textContent = isSchool ? "CNPJ da escola" : "CPF";
    if (documentInput) {
      documentInput.placeholder = isSchool ? "00.000.000/0000-00" : "000.000.000-00";
      documentInput.value = "";
      exibirErroInline(documentInput, "");
    }
    if (schoolName) {
      schoolName.required = isSchool;
      const fieldWrapper = schoolName.closest(".field");
      if (fieldWrapper) fieldWrapper.hidden = !isSchool;
      if (!isSchool) {
        schoolName.value = "";
        exibirErroInline(schoolName, "");
      }
    }
  });
});

const postalCode = document.querySelector("#postal-code");

document.querySelector("#postal-button")?.addEventListener("click", async () => {
  const status = document.querySelector("#postal-status");
  const cleanCep = onlyDigits(postalCode?.value, 8);
  status?.classList.remove("is-success", "is-error");

  if (cleanCep.length !== 8) {
    if (status) {
      status.textContent = "Digite um CEP com 8 números.";
      status.classList.add("is-error");
    }
    postalCode?.focus();
    return;
  }

  if (status) status.textContent = "Buscando CEP...";

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await res.json();
    if (data?.erro) {
      if (status) {
        status.textContent = "CEP não encontrado. Preencha o endereço manualmente.";
        status.classList.add("is-error");
      }
      return;
    }

    const streetEl = document.querySelector("#street");
    const districtEl = document.querySelector("#district");
    const cityEl = document.querySelector("#city");
    const stateEl = document.querySelector("#state");

    if (streetEl && data.logradouro) {
      streetEl.value = data.logradouro;
      exibirErroInline(streetEl, "");
    }
    if (districtEl && data.bairro) {
      districtEl.value = data.bairro;
      exibirErroInline(districtEl, "");
    }
    if (cityEl && data.localidade) {
      cityEl.value = data.localidade;
      exibirErroInline(cityEl, "");
    }
    if (stateEl && data.uf) {
      const optionExists = Array.from(stateEl.options).some((opt) => opt.value === data.uf);
      if (!optionExists) {
        const opt = new Option(data.uf, data.uf);
        stateEl.add(opt);
      }
      stateEl.value = data.uf;
      exibirErroInline(stateEl, "");
    }

    if (status) {
      status.textContent = "Endereço preenchido. Informe o número.";
      status.classList.add("is-success");
    }
    document.querySelector("#number")?.focus();
  } catch {
    if (status) {
      status.textContent = "CEP válido. Preencha os dados do endereço.";
      status.classList.add("is-success");
    }
    document.querySelector("#street")?.focus();
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  formStatus?.classList.remove("is-error");
  if (formStatus) formStatus.textContent = "";

  const invalido = primeiroCampoInvalido(form);
  if (invalido) {
    if (formStatus) {
      formStatus.textContent = "Revise os campos obrigatórios antes de continuar.";
      formStatus.classList.add("is-error");
    }
    invalido.focus();
    return;
  }

  const formData = new FormData(form);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = payment === "pix" ? subtotal * 0.05 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const payload = {
    nome: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    telefone: String(formData.get("phone") || "").trim(),
    tipoCadastro: String(formData.get("person-type") || "school"),
    documento: String(formData.get("document") || "").trim(),
    escola: String(formData.get("school-name") || "").trim(),
    cep: String(formData.get("postal-code") || "").trim(),
    endereco: String(formData.get("street") || "").trim(),
    numero: String(formData.get("number") || "").trim(),
    complemento: String(formData.get("complement") || "").trim(),
    bairro: String(formData.get("district") || "").trim(),
    cidade: String(formData.get("city") || "").trim(),
    uf: String(formData.get("state") || "").trim(),
    frete: shipping,
    formaPagamento: payment,
    parcelas: Number(formData.get("installments") || 1),
    subtotal,
    desconto: discount,
    total,
    itens: items.map((item) => ({
      produtoId: item.id,
      nome: item.name,
      quantidade: item.quantity,
      precoUnitario: item.price
    }))
  };

  if (submitButton) submitButton.disabled = true;
  if (formStatus) formStatus.textContent = "Processando pedido...";

  const token = window.localStorage.getItem(TOKEN_KEY);

  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await apiFetch("/pedidos", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const pedidoId =
      response?.id ||
      response?.pedido?.id ||
      response?.data?.id ||
      response?.data?.pedido?.id ||
      "1";

    window.localStorage.setItem(
      LAST_ORDER_KEY,
      JSON.stringify({ id: pedidoId, ...payload, createdAt: new Date().toISOString() })
    );
    window.localStorage.removeItem(CART_KEY);

    window.location.href = `sucesso.html?pedido=${encodeURIComponent(pedidoId)}`;
  } catch {
    const fallbackId = String(Date.now()).slice(-6);
    window.localStorage.setItem(
      LAST_ORDER_KEY,
      JSON.stringify({ id: fallbackId, ...payload, createdAt: new Date().toISOString() })
    );
    window.localStorage.removeItem(CART_KEY);

    if (formStatus) {
      formStatus.textContent = "Pedido registrado localmente. Redirecionando para o comprovante...";
    }
    window.setTimeout(() => {
      window.location.href = `sucesso.html?pedido=${encodeURIComponent(fallbackId)}`;
    }, 400);
  }
});

renderSummary();