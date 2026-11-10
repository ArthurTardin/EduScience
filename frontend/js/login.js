import { login } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.querySelector("#form-login");

    if (formLogin) {
        formLogin.addEventListener("submit", async (evento) => {
            evento.preventDefault(); // Impede a página de recarregar

            const usuario = document.querySelector("#usuario").value;
            const senha = document.querySelector("#senha").value;

            try {
                await login(usuario, senha);

                console.log("Login aprovado!"); 

                setTimeout(() => {
                    const params = new URLSearchParams(window.location.search);
                    const rotaDeRetorno = params.get("next");

                    if (rotaDeRetorno) {
                        window.location.href = rotaDeRetorno; 
                    } else {
                        window.location.href = "./landing.html"; 
                    }
                }, 600);
               

            } catch (erro) {
                alert("Erro ao entrar: " + erro.message);
                console.error(erro);
            }
        });
    }
});