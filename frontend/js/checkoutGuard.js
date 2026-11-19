import { logout } from "./api.js";

const TOKEN_KEY = "@EduScience:token";

function obterToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function tokenExpirado(token) {
  if (!token) return true;

  try {
    const partes = token.split(".");
    if (partes.length < 2) return true;

    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    if (typeof payload.exp === "number") {
      return payload.exp * 1000 <= Date.now();
    }

    return false;
  } catch (err) {
    console.error("Erro ao validar token JWT:", err);
    return true;
  }
}

export function sessaoValida() {
  const token = obterToken();
  return Boolean(token) && !tokenExpirado(token);
}

document.addEventListener("DOMContentLoaded", () => {
  const botaoFinalizar = document.querySelector("#btn-finalizar, #checkout-button");

  if (!botaoFinalizar) return;

  botaoFinalizar.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (!sessaoValida()) {
      logout();
      window.location.href = "login.html?next=checkout.html";
      return;
    }

    window.location.href = "checkout.html";
  }, true);
});