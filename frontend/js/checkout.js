import { apiFetch } from "./api.js";

const CART_KEY = "eduscience_cart";
const LEGACY_CART_KEY = "lumolab-cart";
const CHECKOUT_META_KEY = "@EduScience:checkout_meta";
const TOKEN_KEY = "@EduScience:token";
const USER_KEY = "@EduScience:user";
const LAST_ORDER_KEY = "@EduScience:last_order";

const FREE_SHIPPING_THRESHOLD = 700;
const ECONOMIC_SHIPPING_FEE = 29.9;
const EXPRESS_SHIPPING_FEE = 39.9;

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
  const price = Number(raw?.preco ?? raw?.price ?? 0);
  const quantity = Math.max(1, Number(raw?.quantidade ?? raw?.quantity ?? 1));
  return {
    id: Number(raw?.id) || index + 1,
    name: raw?.nome ?? raw?.name ?? "Kit Científico",
    meta: raw?.meta ?? raw?.tag ?? "Ciências • Ensino Fundamental",
    price: Number.isFinite(price) ? price : 0,
    quantity: Number.isFinite(quantity) ? quantity : 1,
    art: raw?.art ?? arts[index % arts.length]
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
    return defaultItems;
  }
  return defaultItems;
}

function loadCheckoutMeta() {
  try {
    const raw = window.localStorage.getItem(CHECKOUT_META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getSavedUser() {
  try {
    const rawLocal = window.localStorage.getItem(USER_KEY);
    if (rawLocal) return JSON.parse(rawLocal);
    const rawSession = window.sessionStorage.getItem(USER_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
}

const meta = loadCheckoutMeta();
let items = loadCartItems();
let couponDiscountRate = Number(meta?.discountRate) || 0;
let selectedShippingMode =
  meta?.selectedShippingMode === "express" ||
  Number(document.querySelector('input[name="shipping"]:checked')?.value ?? 0) > 0
    ? "express"
    : "economic";
let payment = document.querySelector('input[name="payment"]:checked')?.value || "card";

if (selectedShippingMode === "express") {
  const expressRadio = document.querySelector('input[name="shipping"][value="39.9"]');
  if (expressRadio) expressRadio.checked = true;
}

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
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number.isFinite(value) ? value : 0
  );

const onlyDigits = (value, limit) => String(value || "").replace(/\D/g, "").slice(0, limit);

function calculateShipping(subtotal) {
  if (items.length === 0) return 0;
  if (selectedShippingMode === "express") return EXPRESS_SHIPPING_FEE;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : ECONOMIC_SHIPPING_FEE;
}

function setFieldError(input, message) {
  if (!input) return;
  input.setAttribute("aria-invalid", message ? "true" : "false");
  let errorEl = input.parentElement?.querySelector(".field-error-msg") ||
    input.closest(".field")?.querySelector(".field-error-msg");

  if (!errorEl && message) {
    errorEl = document.createElement("small");
    errorEl.className = "field-error-msg";
    errorEl.style.color = "var(--error, #b34532)";
    errorEl.style.fontWeight = "700";
    errorEl.style.display = "block";
    errorEl.style.marginTop = "4px";
    const anchor = input.closest(".input-action") || input.closest(".card-input") || input;
    anchor.insertAdjacentElement("afterend", errorEl);
  }

  if (errorEl) {
    errorEl.textContent = message || "";
    errorEl.hidden = !message;
  }
}

function applyMask(input) {
  const maskType = input.dataset.mask;
  if (!maskType) return;

  if (maskType === "telefone") {
    const d = onlyDigits(input.value, 11);
    if (d.length <= 2) input.value = d ? `(${d}` : "";
    else if (d.length <= 6) input.value = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    else if (d.length <= 10) input.value = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    else input.value = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  } else if (maskType === "cnpj_cpf") {
    const d = onlyDigits(input.value, 14);
    if (d.length <= 11) {
      input.value = d
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      input.value = d
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
  } else if (maskType === "cep") {
    const d = onlyDigits(input.value, 8);
    input.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  } else if (maskType === "cartao") {
    const d = onlyDigits(input.value, 16);
    input.value = d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  } else if (maskType === "validade") {
    const d = onlyDigits(input.value, 4);
    input.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  } else if (maskType === "cvv") {
    input.value = onlyDigits(input.value, 4);
  }
}

function fillIfEmpty(input, value) {
  if (!input || !value) return;
  if (String(input.value || "").trim()) return;
  input.value = String(value);
  if (input.dataset.mask) applyMask(input);
  setFieldError(input, "");
}

async function prefillFromProfile() {
  const token = window.localStorage.getItem(TOKEN_KEY);
  let profile = getSavedUser() || {};

  if (token) {
    try {
      const meData = await apiFetch("/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });
      const apiUser = meData?.cliente || meData?.usuario || meData?.user || meData || {};
      profile = { ...profile, ...apiUser };
    } catch {
      // Usa dados locais se /auth/me não estiver disponível
    }
  }

  const end = profile?.endereco || profile?.cadastro || {};

  fillIfEmpty(document.querySelector("#email"), profile.email);
  fillIfEmpty(document.querySelector("#name"), profile.nome || profile.usuario);
  fillIfEmpty(document.querySelector("#phone"), profile.telefone);
  fillIfEmpty(document.querySelector("#document"), profile.cnpj_cpf || profile.documento);
  fillIfEmpty(document.querySelector("#school-name"), profile.nome_escola || profile.escola);

  fillIfEmpty(document.querySelector("#postal-code"), end.cep || profile.cep);
  fillIfEmpty(document.querySelector("#street"), end.logradouro || end.endereco || profile.logradouro);
  fillIfEmpty(document.querySelector("#number"), end.numero || profile.numero);
  fillIfEmpty(document.querySelector("#complement"), end.complemento || profile.complemento);
  fillIfEmpty(document.querySelector("#district"), end.bairro || profile.bairro);
  fillIfEmpty(document.querySelector("#city"), end.cidade || profile.cidade);

  const uf = end.estado || end.uf || profile.estado || profile.uf;
  const stateSelect = document.querySelector("#state");
  if (stateSelect && uf && !String(stateSelect.value || "").trim()) {
    const cleanUf = String(uf).trim().toUpperCase();
    const exists = Array.from(stateSelect.options).some((opt) => opt.value === cleanUf);
    if (!exists) stateSelect.add(new Option(cleanUf, cleanUf));
    stateSelect.value = cleanUf;
    setFieldError(stateSelect, "");
  }
}

function validateField(input) {
  if (!input || input.disabled) return "";
  const fieldHidden = Boolean(input.closest("[hidden]") || input.closest(".payment-panel[hidden]"));
  if (fieldHidden) return "";

  const val = String(input.value || "").trim();
  if (input.required && !val) {
    return "Campo obrigatório.";
  }

  const validator = input.dataset.validate;
  if (!val && !validator) return "";

  if (validator === "email" && val) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
      return "Informe um e-mail válido.";
    }
  } else if (validator === "cep" && val) {
    if (onlyDigits(val, 8).length !== 8) {
      return "CEP deve ter 8 dígitos.";
    }
  } else if (validator === "cnpj_cpf" && val) {
    const len = onlyDigits(val, 14).length;
    if (len !== 11 && len !== 14) {
      return "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.";
    }
  } else if (validator === "cartao" && val) {
    if (onlyDigits(val, 16).length < 13) {
      return "Número de cartão incompleto.";
    }
  } else if (validator === "validade" && val) {
    const d = onlyDigits(val, 4);
    const mm = Number(d.slice(0, 2));
    if (d.length !== 4 || mm < 1 || mm > 12) {
      return "Validade inválida (MM/AA).";
    }
  } else if (validator === "cvv" && val) {
    if (onlyDigits(val, 4).length < 3) {
      return "CVV deve ter 3 ou 4 dígitos.";
    }
  }

  return "";
}

function validateCheckoutForm() {
  if (!form) return null;
  const controls = Array.from(form.querySelectorAll("input, select"));
  let firstInvalid = null;

  for (const ctrl of controls) {
    if (ctrl.type === "radio") continue;
    if (ctrl.type === "checkbox" && ctrl.required) {
      if (!ctrl.checked) {
        if (!firstInvalid) firstInvalid = ctrl;
      }
      continue;
    }
    const err = validateField(ctrl);
    setFieldError(ctrl, err);
    if (err && !firstInvalid) {
      firstInvalid = ctrl;
    }
  }
  return firstInvalid;
}

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
  const shipping = calculateShipping(subtotal);
  const effectiveRate = payment === "pix" ? Math.max(couponDiscountRate, 0.05) : couponDiscountRate;
  const discount = subtotal * effectiveRate;
  const total = Math.max(0, subtotal + shipping - discount);

  const economicRadio = document.querySelector('input[name="shipping"][value="0"]');
  const economicPriceEl = economicRadio?.closest("label")?.querySelector("b");
  if (economicPriceEl) {
    economicPriceEl.textContent =
      subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0
        ? "Grátis"
        : formatCurrency(ECONOMIC_SHIPPING_FEE);
  }

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

form?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
  applyMask(target);
  if (target.getAttribute("aria-invalid") === "true") {
    setFieldError(target, validateField(target));
  }
});

form?.addEventListener("blur", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
  if (target.type === "radio" || target.type === "checkbox") return;
  setFieldError(target, validateField(target));
}, true);

document.querySelectorAll('input[name="shipping"]').forEach((input) => {
  input.addEventListener("change", () => {
    selectedShippingMode = Number(input.value) > 0 ? "express" : "economic";
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
      if (payment !== "card") setFieldError(field, "");
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
      setFieldError(documentInput, "");
    }
    if (schoolName) {
      schoolName.required = isSchool;
      const fieldWrapper = schoolName.closest(".field");
      if (fieldWrapper) fieldWrapper.hidden = !isSchool;
      if (!isSchool) {
        schoolName.value = "";
        setFieldError(schoolName, "");
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
      setFieldError(streetEl, "");
    }
    if (districtEl && data.bairro) {
      districtEl.value = data.bairro;
      setFieldError(districtEl, "");
    }
    if (cityEl && data.localidade) {
      cityEl.value = data.localidade;
      setFieldError(cityEl, "");
    }
    if (stateEl && data.uf) {
      const optionExists = Array.from(stateEl.options).some((opt) => opt.value === data.uf);
      if (!optionExists) {
        stateEl.add(new Option(data.uf, data.uf));
      }
      stateEl.value = data.uf;
      setFieldError(stateEl, "");
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

  const invalido = validateCheckoutForm();
  const termsInput = document.querySelector("#terms");

  if (invalido) {
    if (formStatus) {
      formStatus.textContent = "Revise os campos destacados antes de confirmar o pedido.";
      formStatus.classList.add("is-error");
    }
    invalido.focus();
    return;
  }

  if (termsInput && !termsInput.checked) {
    if (formStatus) {
      formStatus.textContent = "Marque o aceite dos termos de compra para continuar.";
      formStatus.classList.add("is-error");
    }
    termsInput.focus();
    return;
  }

  const formData = new FormData(form);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = calculateShipping(subtotal);
  const effectiveRate = payment === "pix" ? Math.max(couponDiscountRate, 0.05) : couponDiscountRate;
  const discount = subtotal * effectiveRate;
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
      response?.pedido?.id_compra ||
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
    window.localStorage.removeItem(CHECKOUT_META_KEY);

    window.location.href = `sucesso.html?pedido=${encodeURIComponent(pedidoId)}`;
  } catch {
    if (submitButton) submitButton.disabled = false;
    const fallbackId = String(Date.now()).slice(-6);
    window.localStorage.setItem(
      LAST_ORDER_KEY,
      JSON.stringify({ id: fallbackId, ...payload, createdAt: new Date().toISOString() })
    );
    window.localStorage.removeItem(CART_KEY);
    window.localStorage.removeItem(CHECKOUT_META_KEY);

    if (formStatus) {
      formStatus.textContent = "Pedido registrado localmente. Redirecionando para o comprovante...";
    }
    window.setTimeout(() => {
      window.location.href = `sucesso.html?pedido=${encodeURIComponent(fallbackId)}`;
    }, 400);
  }
});

renderSummary();
prefillFromProfile();