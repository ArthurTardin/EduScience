
import { login } from "./api.js";

const form = document.querySelector("#login-form");
const usuarioInput = document.querySelector("#usuario");
const passwordInput = document.querySelector("#senha");
const passwordToggle = document.querySelector("#password-toggle");
const submitButton = document.querySelector("#submit-button");
const msgErro = document.querySelector("#mensagem-erro");
const statusMessage = document.querySelector("#status-message");

// Mostrar e ocultar senha
if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", () => {
        const mostrarSenha = passwordInput.type === "password";

        passwordInput.type = mostrarSenha ? "text" : "password";
        passwordToggle.textContent = mostrarSenha ? "Ocultar" : "Mostrar";
        passwordToggle.setAttribute("aria-pressed", String(mostrarSenha));
        passwordToggle.setAttribute(
            "aria-label",
            mostrarSenha ? "Ocultar senha" : "Mostrar senha"
        );
    });
}

// Fazer login
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
        return;
    }

    const usuario = usuarioInput.value.trim();
    const senha = passwordInput.value.trim();

    if (msgErro) {
        msgErro.hidden = true;
        msgErro.textContent = "";
    }

    submitButton.disabled = true;
    submitButton.textContent = "Entrando...";

    if (statusMessage) {
        statusMessage.textContent = "Validando acesso com o servidor...";
    }

    try {
        const dadosUsuario = await login(usuario, senha);

        localStorage.setItem(
            "usuario_eduscience",
            JSON.stringify(dadosUsuario.usuario)
        );

        if (statusMessage) {
            statusMessage.textContent = "Acesso confirmado.";
        }

        submitButton.textContent = "Login realizado!";

        setTimeout(() => {
            window.location.href = "./landing.html";
        }, 600);

    } catch (error) {
        if (msgErro) {
            msgErro.textContent = error.message;
            msgErro.hidden = false;
        }

        if (statusMessage) {
            statusMessage.textContent = "Não foi possível realizar o login.";
        }

        submitButton.disabled = false;
        submitButton.textContent = "Entrar";
    }
});
