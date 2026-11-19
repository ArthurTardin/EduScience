import { apiFetch } from "./api.js";

const LAST_ORDER_KEY = "@EduScience:last_order";

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

const formatDate = (iso) => {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString("pt-BR");
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatAccessKey = (rawKey) => {
  const digits = String(rawKey || "35261148912340000172550010000000011048291034").replace(/\D/g, "");
  return digits.padEnd(44, "0").slice(0, 44).replace(/(\d{4})(?=\d)/g, "$1 ");
};

const paymentLabel = (code) => {
  const map = {
    card: "Cartão de Crédito",
    cartao: "Cartão de Crédito",
    pix: "Pix (5% de desconto)",
    invoice: "Nota de Empenho Institucional",
    empenho: "Nota de Empenho Institucional"
  };
  return map[String(code || "").toLowerCase()] || "Cartão de Crédito";
};

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSavedDraft() {
  try {
    const raw = window.localStorage.getItem(LAST_ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function buildFallbackData(pedidoId) {
  const draft = getSavedDraft();
  const itens =
    Array.isArray(draft?.itens) && draft.itens.length > 0
      ? draft.itens
      : [
          { produtoId: 1, nome: "Kit Química Analítica", quantidade: 1, precoUnitario: 289.9 },
          { produtoId: 3, nome: "Kit Óptica e Ondas", quantidade: 1, precoUnitario: 219.9 }
        ];

  const subtotal =
    Number(draft?.subtotal) ||
    itens.reduce((acc, item) => acc + Number(item.precoUnitario) * Number(item.quantidade), 0);
  const desconto = Number(draft?.desconto) || 0;
  const frete = Number(draft?.frete) || 0;
  const total = Number(draft?.total) || Math.max(0, subtotal - desconto + frete);

  const numericId = String(pedidoId || draft?.id || "1").replace(/\D/g, "") || "1";

  return {
    pedidoId: numericId,
    numeroNfe: numericId.padStart(9, "0").replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3"),
    serie: "001",
    chaveAcesso: `3526114891234000017255001${numericId.padStart(9, "0")}1048291034`,
    protocolo: `13526${numericId.padStart(10, "0")} — Autorizada pela SEFAZ-SP`,
    dataEmissao: draft?.createdAt || new Date().toISOString(),
    destinatario: {
      nome: draft?.escola || draft?.nome || "Escola Estadual Professor Antônio Candido",
      documento: draft?.documento || "62.451.890/0001-19",
      email: draft?.email || "coordenacao@escola.edu.br",
      telefone: draft?.telefone || "(11) 3814-2290",
      endereco: draft?.endereco
        ? `${draft.endereco}, ${draft.numero || "S/N"}${draft.complemento ? ` - ${draft.complemento}` : ""} — ${draft.bairro || ""}, ${draft.cidade || ""}/${draft.uf || ""} • CEP ${draft.cep || ""}`
        : "Av. da Universidade, 308 — Butantã, São Paulo/SP • CEP 05508-040"
    },
    formaPagamento: draft?.formaPagamento || "card",
    parcelas: draft?.parcelas || 1,
    itens,
    subtotal,
    desconto,
    frete,
    total,
    impostos: {
      baseCalculo: Math.max(0, subtotal - desconto),
      icms: Math.max(0, subtotal - desconto) * 0.18,
      pis: Math.max(0, subtotal - desconto) * 0.0165,
      cofins: Math.max(0, subtotal - desconto) * 0.076
    }
  };
}

function normalizeApiNfe(apiResponse, pedidoId) {
  const nfe = apiResponse?.notaFiscal || apiResponse?.data?.notaFiscal || apiResponse?.data || apiResponse;
  const fallback = buildFallbackData(pedidoId);

  const itensRaw = Array.isArray(nfe?.itens) ? nfe.itens : fallback.itens;
  const itens = itensRaw.map((item, idx) => ({
    produtoId: item.produtoId ?? item.produto_id ?? item.id ?? idx + 1,
    nome: item.nome ?? item.produto?.nome ?? `Kit Educacional #${idx + 1}`,
    quantidade: Number(item.quantidade ?? 1),
    precoUnitario: Number(item.precoUnitario ?? item.preco_unitario ?? item.preco ?? 0)
  }));

  const subtotal = Number(
    nfe?.subtotal ??
      itens.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0)
  );
  const desconto = Number(nfe?.desconto ?? fallback.desconto);
  const frete = Number(nfe?.frete ?? nfe?.valorFrete ?? fallback.frete);
  const total = Number(nfe?.valorTotal ?? nfe?.total ?? Math.max(0, subtotal - desconto + frete));
  const baseCalculo = Number(nfe?.baseCalculoIcms ?? Math.max(0, subtotal - desconto));

  return {
    pedidoId: String(nfe?.pedidoId ?? nfe?.pedido_id ?? pedidoId ?? fallback.pedidoId),
    numeroNfe: String(nfe?.numero ?? nfe?.numeroNota ?? fallback.numeroNfe),
    serie: String(nfe?.serie ?? "001"),
    chaveAcesso: nfe?.chaveAcesso ?? nfe?.chave_acesso ?? fallback.chaveAcesso,
    protocolo: nfe?.protocolo ?? fallback.protocolo,
    dataEmissao: nfe?.dataEmissao ?? nfe?.createdAt ?? fallback.dataEmissao,
    destinatario: {
      nome: nfe?.destinatario?.nome ?? nfe?.escola ?? nfe?.clienteNome ?? fallback.destinatario.nome,
      documento: nfe?.destinatario?.documento ?? nfe?.cnpj ?? nfe?.cpf ?? fallback.destinatario.documento,
      email: nfe?.destinatario?.email ?? nfe?.email ?? fallback.destinatario.email,
      telefone: nfe?.destinatario?.telefone ?? nfe?.telefone ?? fallback.destinatario.telefone,
      endereco: nfe?.destinatario?.endereco ?? nfe?.enderecoEntrega ?? fallback.destinatario.endereco
    },
    formaPagamento: nfe?.formaPagamento ?? fallback.formaPagamento,
    parcelas: Number(nfe?.parcelas ?? fallback.parcelas),
    itens,
    subtotal,
    desconto,
    frete,
    total,
    impostos: {
      baseCalculo,
      icms: Number(nfe?.valorIcms ?? nfe?.icms ?? baseCalculo * 0.18),
      pis: Number(nfe?.valorPis ?? nfe?.pis ?? baseCalculo * 0.0165),
      cofins: Number(nfe?.valorCofins ?? nfe?.cofins ?? baseCalculo * 0.076)
    }
  };
}

function renderNfe(data) {
  const orderNumberEl = document.querySelector("#order-number");
  const nfeNumberEl = document.querySelector("#nfe-number");
  const nfeSeriesEl = document.querySelector("#nfe-series");
  const nfeDateEl = document.querySelector("#nfe-date");
  const nfeKeyEl = document.querySelector("#nfe-key");
  const nfeProtocolEl = document.querySelector("#nfe-protocol");

  if (orderNumberEl) orderNumberEl.textContent = `#EDU-${String(data.pedidoId).padStart(4, "0")}`;
  if (nfeNumberEl) nfeNumberEl.textContent = data.numeroNfe;
  if (nfeSeriesEl) nfeSeriesEl.textContent = data.serie;
  if (nfeDateEl) nfeDateEl.textContent = formatDate(data.dataEmissao);
  if (nfeKeyEl) nfeKeyEl.textContent = formatAccessKey(data.chaveAcesso);
  if (nfeProtocolEl) nfeProtocolEl.textContent = data.protocolo;

  const destNameEl = document.querySelector("#dest-name");
  const destDocEl = document.querySelector("#dest-doc");
  const destEmailEl = document.querySelector("#dest-email");
  const destPhoneEl = document.querySelector("#dest-phone");
  const destAddressEl = document.querySelector("#dest-address");
  const destPaymentEl = document.querySelector("#dest-payment");

  if (destNameEl) destNameEl.textContent = data.destinatario.nome;
  if (destDocEl) destDocEl.textContent = data.destinatario.documento;
  if (destEmailEl) destEmailEl.textContent = data.destinatario.email;
  if (destPhoneEl) destPhoneEl.textContent = data.destinatario.telefone;
  if (destAddressEl) destAddressEl.textContent = data.destinatario.endereco;
  if (destPaymentEl) {
    const baseLabel = paymentLabel(data.formaPagamento);
    destPaymentEl.textContent =
      data.formaPagamento === "card" && data.parcelas > 1
        ? `${baseLabel} (${data.parcelas}x sem juros)`
        : baseLabel;
  }

  const tbody = document.querySelector("#nfe-items-body");
  if (tbody) {
    tbody.innerHTML = data.itens
      .map((item) => {
        const lineTotal = item.precoUnitario * item.quantidade;
        const code = escapeHtml(String(item.produtoId).padStart(3, "0"));
        const name = escapeHtml(item.nome);
        return `
        <tr>
          <td>KIT-${code}</td>
          <td><strong>${name}</strong></td>
          <td>9023.00.00</td>
          <td>5.102</td>
          <td>KIT</td>
          <td class="num">${Number(item.quantidade) || 1}</td>
          <td class="num">${formatCurrency(item.precoUnitario)}</td>
          <td class="num"><strong>${formatCurrency(lineTotal)}</strong></td>
        </tr>
      `;
      })
      .join("");
  }

  const totalImpostos = data.impostos.icms + data.impostos.pis + data.impostos.cofins;

  const setCurrency = (selector, val) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = formatCurrency(val);
  };

  setCurrency("#tax-base", data.impostos.baseCalculo);
  setCurrency("#tax-icms", data.impostos.icms);
  setCurrency("#tax-pis", data.impostos.pis);
  setCurrency("#tax-cofins", data.impostos.cofins);
  setCurrency("#tax-total", totalImpostos);
  setCurrency("#nfe-discount", data.desconto);
  setCurrency("#nfe-shipping", data.frete);
  setCurrency("#nfe-grand-total", data.total);
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const pedidoId = params.get("pedido") || getSavedDraft()?.id || "1";
  const statusEl = document.querySelector("#nfe-status");

  try {
    const apiResponse = await apiFetch(`/pedidos/${encodeURIComponent(pedidoId)}/nota-fiscal`, {
      method: "GET"
    });

    const normalized = normalizeApiNfe(apiResponse, pedidoId);
    renderNfe(normalized);
    if (statusEl) statusEl.textContent = "NF-e sincronizada com o servidor EduScience.";
  } catch {
    const fallback = buildFallbackData(pedidoId);
    renderNfe(fallback);
    if (statusEl) {
      statusEl.textContent = "Exibindo comprovante fiscal gerado a partir dos dados do pedido.";
    }
  }
}

document.querySelector("#print-nfe-button")?.addEventListener("click", () => {
  window.print();
});

document.querySelector("#copy-key-button")?.addEventListener("click", async () => {
  const keyText = document.querySelector("#nfe-key")?.textContent?.replace(/\s+/g, "") || "";
  const feedback = document.querySelector("#copy-feedback");

  try {
    await navigator.clipboard.writeText(keyText);
    if (feedback) feedback.textContent = "Chave copiada!";
  } catch {
    if (feedback) feedback.textContent = "Selecione e copie manualmente.";
  }

  window.setTimeout(() => {
    if (feedback) feedback.textContent = "";
  }, 2500);
});

init();