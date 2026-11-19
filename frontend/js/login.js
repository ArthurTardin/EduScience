import { apiFetch } from "./api.js";
import { primeiroCampoInvalido, exibirErroInline } from "./validacao.js";

const TOKEN_KEY = "@EduScience:token";
const USER_KEY = "@EduScience:user";

const form = document.querySelector("#login-form");
const loginInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordToggle = document.querySelector("#password-toggle");
const rememberInput = document.querySelector("#remember");
const submitButton = document.querySelector("#submit-button");
const errorBox = document.querySelector("#mensagem-erro");
const statusMessage = document.querySelector("#status-message");

function showError(message) {
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function clearError() {
  if (!errorBox) return;
  errorBox.textContent = "";
  errorBox.hidden = true;
}

function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  if (!next) return "landing.html";

  const safePages = ["landing.html", "carrinho.html", "checkout.html", "cadastro.html", "sucesso.html"];
  return safePages.includes(next) ? next : "landing.html";
}

passwordToggle?.addEventListener("click", () => {
  if (!passwordInput || !passwordToggle) return;
  const shouldShow = passwordInput.type === "password";

  passwordInput.type = shouldShow ? "text" : "password";
  passwordToggle.classList.toggle("password-visible", shouldShow);
  passwordToggle.setAttribute("aria-pressed", String(shouldShow));
  passwordToggle.setAttribute("aria-label", shouldShow ? "Ocultar senha" : "Mostrar senha");
});

loginInput?.addEventListener("input", clearError);
passwordInput?.addEventListener("input", () => {
  clearError();
  if (passwordInput.value.length >= 6) {
    exibirErroInline(passwordInput, "");
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const invalido = primeiroCampoInvalido(form);
  if (invalido) {
    invalido.focus();
    return;
  }

  const identifier = loginInput?.value.trim() || "";
  const senha = passwordInput?.value || "";

  if (senha.length < 6) {
    exibirErroInline(passwordInput, "A senha deve ter pelo menos 6 caracteres.");
    showError("A senha deve ter pelo menos 6 caracteres.");
    passwordInput?.focus();
    return;
  }
  exibirErroInline(passwordInput, "");

  submitButton.disabled = true;
  submitButton.classList.remove("is-success");
  submitButton.classList.add("is-loading");
  if (statusMessage) statusMessage.textContent = "Validando acesso...";

  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        usuario: identifier,
        email: identifier,
        senha
      })
    });

    const token = data?.token || data?.data?.token;
    if (!token) {
      throw new Error("Token de autenticação não retornado pela API.");
    }

    localStorage.setItem(TOKEN_KEY, token);

    const userData = data?.usuario || data?.user || data?.data?.usuario || { login: identifier };
    if (rememberInput?.checked) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
    }

    submitButton.classList.remove("is-loading");
    submitButton.classList.add("is-success");
    if (statusMessage) statusMessage.textContent = "Acesso confirmado. Redirecionando...";

    window.setTimeout(() => {
      window.location.href = getRedirectUrl();
    }, 500);
  } catch (error) {
    submitButton.classList.remove("is-loading");
    submitButton.classList.remove("is-success");
    submitButton.disabled = false;
    const msg = error?.message || "Não foi possível entrar. Verifique suas credenciais.";
    showError(msg);
    if (statusMessage) statusMessage.textContent = msg;
  }
});