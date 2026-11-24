import { apiFetch } from "./api.js";

const TOKEN_KEY = "@EduScience:token";
const USER_KEY = "@EduScience:user";

const form = document.querySelector("#register-form");
const accountTypeInputs = document.querySelectorAll('input[name="account-type"]');
const docLabel = document.querySelector("#doc-label");
const docInput = document.querySelector("#doc-number");
const schoolField = document.querySelector("#school-field");
const schoolNameInput = document.querySelector("#school-name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");
const fullNameInput = document.querySelector("#full-name");
const postalCodeInput = document.querySelector("#postal-code");
const postalButton = document.querySelector("#postal-button");
const postalStatus = document.querySelector("#postal-status");
const streetInput = document.querySelector("#street");
const numberInput = document.querySelector("#number");
const complementInput = document.querySelector("#complement");
const districtInput = document.querySelector("#district");
const cityInput = document.querySelector("#city");
const stateInput = document.querySelector("#state");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirm-password");
const termsInput = document.querySelector("#terms");
const submitButton = document.querySelector("#submit-register");
const statusElement = document.querySelector("#register-status");

const onlyDigits = (value, limit) => String(value || "").replace(/\D/g, "").slice(0, limit);

let lastQueriedCep = "";

function setFieldError(input, message) {
  if (!input) return;
  input.setAttribute("aria-invalid", message ? "true" : "false");
  let errorEl =
    input.parentElement?.querySelector(".field-error-msg") ||
    input.closest(".field")?.querySelector(".field-error-msg");

  if (!errorEl && message) {
    errorEl = document.createElement("small");
    errorEl.className = "field-error-msg";
    errorEl.style.color = "var(--error, #b34532)";
    errorEl.style.fontWeight = "700";
    errorEl.style.display = "block";
    errorEl.style.marginTop = "4px";
    const anchor = input.closest(".input-action") || input;
    anchor.insertAdjacentElement("afterend", errorEl);
  }

  if (errorEl) {
    errorEl.textContent = message || "";
    errorEl.hidden = !message;
  }
}

function applyMask(input) {
  const maskType = input?.dataset?.mask;
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
  }
}

async function lookupCep({ focusNumber = true } = {}) {
  const cleanCep = onlyDigits(postalCodeInput?.value, 8);
  postalStatus?.classList.remove("is-success", "is-error");

  if (cleanCep.length !== 8) {
    if (postalStatus) {
      postalStatus.textContent = "Digite um CEP com 8 números.";
      postalStatus.classList.add("is-error");
    }
    postalCodeInput?.focus();
    return;
  }

  lastQueriedCep = cleanCep;
  if (postalStatus) postalStatus.textContent = "Buscando CEP...";
  if (postalButton) postalButton.disabled = true;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await res.json();

    if (data?.erro) {
      if (postalStatus) {
        postalStatus.textContent = "CEP não encontrado. Preencha o endereço manualmente.";
        postalStatus.classList.add("is-error");
      }
      return;
    }

    if (streetInput && data.logradouro) {
      streetInput.value = data.logradouro;
      setFieldError(streetInput, "");
    }
    if (districtInput && data.bairro) {
      districtInput.value = data.bairro;
      setFieldError(districtInput, "");
    }
    if (cityInput && data.localidade) {
      cityInput.value = data.localidade;
      setFieldError(cityInput, "");
    }
    if (stateInput && data.uf) {
      const optionExists = Array.from(stateInput.options).some((opt) => opt.value === data.uf);
      if (!optionExists) {
        stateInput.add(new Option(data.uf, data.uf));
      }
      stateInput.value = data.uf;
      setFieldError(stateInput, "");
    }

    setFieldError(postalCodeInput, "");
    if (postalStatus) {
      postalStatus.textContent = "Endereço preenchido. Informe o número.";
      postalStatus.classList.add("is-success");
    }
    if (focusNumber) numberInput?.focus();
  } catch {
    if (postalStatus) {
      postalStatus.textContent = "Não foi possível consultar o CEP. Preencha manualmente.";
      postalStatus.classList.add("is-error");
    }
  } finally {
    if (postalButton) postalButton.disabled = false;
  }
}

function validateRegisterForm() {
  const isSchool =
    document.querySelector('input[name="account-type"]:checked')?.value !== "individual";
  let firstInvalid = null;

  const nomeVal = String(fullNameInput?.value || "").trim();
  const nomeErr = nomeVal ? "" : "Informe seu nome completo.";
  setFieldError(fullNameInput, nomeErr);
  if (nomeErr && !firstInvalid) firstInvalid = fullNameInput;

  const docDigits = onlyDigits(docInput?.value, isSchool ? 14 : 11);
  const expectedDocLen = isSchool ? 14 : 11;
  const docErr =
    docDigits.length === expectedDocLen
      ? ""
      : isSchool
        ? "CNPJ deve ter 14 dígitos."
        : "CPF deve ter 11 dígitos.";
  setFieldError(docInput, docErr);
  if (docErr && !firstInvalid) firstInvalid = docInput;

  if (isSchool) {
    const schoolVal = String(schoolNameInput?.value || "").trim();
    const schoolErr = schoolVal ? "" : "Informe o nome da escola.";
    setFieldError(schoolNameInput, schoolErr);
    if (schoolErr && !firstInvalid) firstInvalid = schoolNameInput;
  } else {
    setFieldError(schoolNameInput, "");
  }

  const emailVal = String(emailInput?.value || "").trim();
  const emailErr = !emailVal
    ? "Informe seu e-mail."
    : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailVal)
      ? "Informe um e-mail válido."
      : "";
  setFieldError(emailInput, emailErr);
  if (emailErr && !firstInvalid) firstInvalid = emailInput;

  const phoneDigits = onlyDigits(phoneInput?.value, 11);
  const phoneErr =
    phoneDigits.length === 10 || phoneDigits.length === 11
      ? ""
      : "Informe um telefone com DDD (10 ou 11 dígitos).";
  setFieldError(phoneInput, phoneErr);
  if (phoneErr && !firstInvalid) firstInvalid = phoneInput;

  const cepDigits = onlyDigits(postalCodeInput?.value, 8);
  const cepErr = cepDigits.length === 8 ? "" : "CEP deve ter 8 dígitos.";
  setFieldError(postalCodeInput, cepErr);
  if (cepErr && !firstInvalid) firstInvalid = postalCodeInput;

  const streetErr = String(streetInput?.value || "").trim() ? "" : "Informe a rua ou avenida.";
  setFieldError(streetInput, streetErr);
  if (streetErr && !firstInvalid) firstInvalid = streetInput;

  const numberErr = String(numberInput?.value || "").trim() ? "" : "Informe o número.";
  setFieldError(numberInput, numberErr);
  if (numberErr && !firstInvalid) firstInvalid = numberInput;

  const districtErr = String(districtInput?.value || "").trim() ? "" : "Informe o bairro.";
  setFieldError(districtInput, districtErr);
  if (districtErr && !firstInvalid) firstInvalid = districtInput;

  const cityErr = String(cityInput?.value || "").trim() ? "" : "Informe a cidade.";
  setFieldError(cityInput, cityErr);
  if (cityErr && !firstInvalid) firstInvalid = cityInput;

  const stateErr = String(stateInput?.value || "").trim() ? "" : "Selecione a UF.";
  setFieldError(stateInput, stateErr);
  if (stateErr && !firstInvalid) firstInvalid = stateInput;

  const passVal = String(passwordInput?.value || "");
  const passErr = passVal.length >= 6 ? "" : "A senha deve ter pelo menos 6 caracteres.";
  setFieldError(passwordInput, passErr);
  if (passErr && !firstInvalid) firstInvalid = passwordInput;

  const confirmVal = String(confirmPasswordInput?.value || "");
  const confirmErr = !confirmVal
    ? "Confirme sua senha."
    : confirmVal !== passVal
      ? "As senhas informadas não coincidem."
      : "";
  setFieldError(confirmPasswordInput, confirmErr);
  if (confirmErr && !firstInvalid) firstInvalid = confirmPasswordInput;

  return firstInvalid;
}

postalButton?.addEventListener("click", () => lookupCep({ focusNumber: true }));

postalCodeInput?.addEventListener("input", () => {
  const digits = onlyDigits(postalCodeInput.value, 8);
  if (digits.length === 8 && digits !== lastQueriedCep) {
    lookupCep({ focusNumber: true });
  }
});

accountTypeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const isSchool = input.value === "school";

    if (docLabel) docLabel.textContent = isSchool ? "CNPJ da escola" : "CPF";
    if (docInput) {
      docInput.placeholder = isSchool ? "00.000.000/0000-00" : "000.000.000-00";
      docInput.value = "";
      setFieldError(docInput, "");
    }

    if (schoolField) schoolField.hidden = !isSchool;
    if (schoolNameInput) {
      schoolNameInput.required = isSchool;
      if (!isSchool) {
        schoolNameInput.value = "";
        setFieldError(schoolNameInput, "");
      }
    }
  });
});

form?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
  if (target instanceof HTMLInputElement) applyMask(target);
  if (target.getAttribute("aria-invalid") === "true") {
    validateRegisterForm();
  }
});

form?.addEventListener("blur", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
  if (target.type === "radio" || target.type === "checkbox") return;
  validateRegisterForm();
}, true);

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusElement?.classList.remove("is-error");
  if (statusElement) statusElement.textContent = "";

  const invalido = validateRegisterForm();
  if (invalido) {
    if (statusElement) {
      statusElement.textContent = "Revise os campos destacados antes de continuar.";
      statusElement.classList.add("is-error");
    }
    invalido.focus();
    return;
  }

  if (termsInput && !termsInput.checked) {
    if (statusElement) {
      statusElement.textContent = "Marque o aceite dos termos de uso para criar sua conta.";
      statusElement.classList.add("is-error");
    }
    termsInput.focus();
    return;
  }

  const formData = new FormData(form);
  const accountType = String(formData.get("account-type") || "school");
  const nome = String(formData.get("full-name") || "").trim();
  const escola = accountType === "school" ? String(formData.get("school-name") || "").trim() : nome;
  const documento = onlyDigits(formData.get("doc-number"), accountType === "school" ? 14 : 11);
  const email = String(formData.get("email") || "").trim();
  const telefone = onlyDigits(formData.get("phone"), 11);
  const cep = String(formData.get("postal-code") || "").trim();
  const logradouro = String(formData.get("street") || "").trim();
  const numero = String(formData.get("number") || "").trim();
  const complemento = String(formData.get("complement") || "").trim();
  const bairro = String(formData.get("district") || "").trim();
  const cidade = String(formData.get("city") || "").trim();
  const estado = String(formData.get("state") || "").trim();

  const payload = {
    nome,
    tipoPerfil: accountType,
    nome_escola: escola,
    escola,
    cnpj_cpf: documento,
    documento,
    email,
    telefone,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    senha: String(formData.get("password") || "")
  };

  if (submitButton) submitButton.disabled = true;
  if (statusElement) statusElement.textContent = "Criando conta...";

  try {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload)
    });

    const token = data?.token || data?.accessToken || data?.data?.token;
    const user = {
      nome,
      nome_escola: escola,
      escola,
      cnpj_cpf: documento,
      documento,
      email,
      telefone,
      endereco: {
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado
      },
      ...(data?.usuario || data?.user || data?.data?.usuario || {})
    };

    window.localStorage.setItem(USER_KEY, JSON.stringify(user));

    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
      if (statusElement) {
        statusElement.textContent = "Conta criada com sucesso! Redirecionando para os kits...";
      }
      window.setTimeout(() => {
        window.location.href = "landing.html";
      }, 600);
    } else {
      if (statusElement) {
        statusElement.textContent = "Conta criada! Redirecionando para o login...";
      }
      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 700);
    }
  } catch (error) {
    if (statusElement) {
      statusElement.textContent =
        error?.message || "Não foi possível concluir o cadastro agora. Tente novamente.";
      statusElement.classList.add("is-error");
    }
    if (submitButton) submitButton.disabled = false;
  }
});