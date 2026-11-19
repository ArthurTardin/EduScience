import { apiFetch } from "./api.js";
import { primeiroCampoInvalido, exibirErroInline } from "./validacao.js";

const TOKEN_KEY = "@EduScience:token";
const USER_KEY = "@EduScience:user";

const form = document.querySelector("#register-form");
const accountTypeInputs = document.querySelectorAll('input[name="account-type"]');
const docLabel = document.querySelector("#doc-label");
const docInput = document.querySelector("#doc-number");
const schoolField = document.querySelector("#school-field");
const schoolNameInput = document.querySelector("#school-name");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirm-password");
const submitButton = document.querySelector("#submit-register");
const statusElement = document.querySelector("#register-status");

const onlyDigits = (value, limit) => String(value || "").replace(/\D/g, "").slice(0, limit);

accountTypeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const isSchool = input.value === "school";

    if (docLabel) docLabel.textContent = isSchool ? "CNPJ da escola" : "CPF";
    if (docInput) {
      docInput.placeholder = isSchool ? "00.000.000/0000-00" : "000.000.000-00";
      docInput.value = "";
      exibirErroInline(docInput, "");
    }

    if (schoolField) schoolField.hidden = !isSchool;
    if (schoolNameInput) {
      schoolNameInput.required = isSchool;
      if (!isSchool) {
        schoolNameInput.value = "";
        exibirErroInline(schoolNameInput, "");
      }
    }
  });
});

confirmPasswordInput?.addEventListener("input", () => {
  if (confirmPasswordInput.value && passwordInput?.value !== confirmPasswordInput.value) {
    exibirErroInline(confirmPasswordInput, "As senhas informadas não coincidem.");
  } else {
    exibirErroInline(confirmPasswordInput, "");
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusElement?.classList.remove("is-error");
  if (statusElement) statusElement.textContent = "";

  const invalido = primeiroCampoInvalido(form);
  if (invalido) {
    if (statusElement) {
      statusElement.textContent = "Revise os campos destacados antes de continuar.";
      statusElement.classList.add("is-error");
    }
    invalido.focus();
    return;
  }

  if (passwordInput?.value !== confirmPasswordInput?.value) {
    exibirErroInline(confirmPasswordInput, "As senhas informadas não coincidem.");
    if (statusElement) {
      statusElement.textContent = "As senhas informadas não coincidem.";
      statusElement.classList.add("is-error");
    }
    confirmPasswordInput?.focus();
    return;
  }

  const formData = new FormData(form);
  const accountType = String(formData.get("account-type") || "school");

  const payload = {
    nome: String(formData.get("full-name") || "").trim(),
    tipoPerfil: accountType,
    documento: onlyDigits(formData.get("doc-number"), accountType === "school" ? 14 : 11),
    escola: accountType === "school" ? String(formData.get("school-name") || "").trim() : "",
    email: String(formData.get("email") || "").trim(),
    telefone: onlyDigits(formData.get("phone"), 11),
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
    const user = data?.usuario || data?.user || data?.data?.usuario || {
      nome: payload.nome,
      email: payload.email,
      escola: payload.escola
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