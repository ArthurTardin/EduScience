import { logout } from "./api.js";

// Busca o token em ambas as convenções de chave
function obterToken() {
  return localStorage.getItem("token") || localStorage.getItem("@EduScience:token");
}

function tokenExpirado(token) {
  if (!token) return true;

  try {
    const partes = token.split(".");
    if (partes.length < 2) return true;

    // Decodificação segura de Base64 para UTF-8
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    // Se tiver o campo exp, valida a expiração (exp em segundos vs Date.now() em ms)
    if (typeof payload.exp === "number") {
      return payload.exp * 1000 <= Date.now();
    }
    
    return false; // Token sem exp expiração explícita é considerado válido no mock
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
      if (!sessaoValida()) {
        e.preventDefault();
        
        // Executa a limpeza antes de redirecionar
        try { logout(); } catch (err) {}
        localStorage.removeItem("token");
        localStorage.removeItem("@EduScience:token");

        window.location.href = "login.html?next=carrinho.html";
      } else {
        console.log("Sessão válida! Prosseguindo com o checkout...");
      }
    });
  }
});