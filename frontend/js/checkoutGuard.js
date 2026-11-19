import { logout } from "./api.js";

function obterToken() {
  return localStorage.getItem("@EduScience:token") || localStorage.getItem("token");
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

    return true;
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
  const botaoFinalizar = document.querySelector("#btn-finalizar");

  if (botaoFinalizar) {
    botaoFinalizar.addEventListener("click", (e) => {
      e.preventDefault();

      if (!sessaoValida()) {
        try { logout(); } catch {}
        localStorage.removeItem("token");
        localStorage.removeItem("@EduScience:token");

        window.location.href = "login.html?next=checkout.html";
        return;
      }

      window.location.href = "checkout.html";
    });
  }
});