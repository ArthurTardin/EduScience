import { getToken, logout } from "./api.js";

function tokenExpirado(token) {
    if (!token) return true;

    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const payload = JSON.parse(new TextDecoder().decode(bytes));

        return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
    } catch {
        return true; 
    }
}

function sessaoValida() {
    const token = getToken();
    return Boolean(token) && !tokenExpirado(token);
}

document.addEventListener("DOMContentLoaded", () => {
    const botaoFinalizar = document.querySelector("#btn-finalizar");

    if (botaoFinalizar) {
        botaoFinalizar.addEventListener("click", () => {
            if (!sessaoValida()) {
                logout(); 
                
                window.location.href = "login.html?next=carrinho.html";
                return;
            }
        });
    }
});