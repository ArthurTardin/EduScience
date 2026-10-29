import { login } from "./api.js";

const form = document.getElementById("login-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const usuario = await login(email, senha);

    localStorage.setItem("usuario", JSON.stringify(usuario));

    window.location.href = "/landing.html";
  } catch (error) {
    console.error(error);
    alert("Usuário ou senha inválidos.");
  }
});