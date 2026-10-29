import { cadastro } from "./api.js";

const form = document.getElementById("cadastro-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const usuario = await cadastro({
    nome,
    email,
    senha,
  });

  localStorage.setItem(
    "usuario",
    JSON.stringify(usuario)
  );

  window.location.href = "login.html";
});