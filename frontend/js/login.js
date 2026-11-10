document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.querySelector("#form-login");
  const mensagemErro = document.querySelector("#mensagem-erro");
  const btnSubmit = formLogin?.querySelector("button[type='submit']");

  if (formLogin) {
    formLogin.removeAttribute("action");
    formLogin.removeAttribute("method");

    formLogin.addEventListener("submit", (evento) => {
      evento.preventDefault();
      evento.stopPropagation();

      const usuarioInput = document.querySelector("#usuario");
      const senhaInput = document.querySelector("#senha");

      const usuario = usuarioInput ? usuarioInput.value.trim() : "";
      const senha = senhaInput ? senhaInput.value.trim() : "";

      if (mensagemErro) mensagemErro.textContent = "";

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Entrando...";
      }

      setTimeout(() => {
        if (usuario && senha) {
          const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
          const payload = btoa(JSON.stringify({ 
            exp: Math.floor(Date.now() / 1000) + 3600, 
            user: usuario 
          }));
          const tokenMock = `${header}.${payload}.signature_mock`;

          localStorage.setItem("token", tokenMock);

          console.log("Login mock aprovado com sucesso!");

          const params = new URLSearchParams(window.location.search);
          const rotaDeRetorno = params.get("next");
          
          const eRotaSegura = rotaDeRetorno && 
                              !rotaDeRetorno.includes("://") && 
                              !rotaDeRetorno.startsWith("//");

          if (eRotaSegura) {
            window.location.href = rotaDeRetorno;
          } else {
            window.location.href = "landing.html";
          }
        } else {
          if (mensagemErro) {
            mensagemErro.textContent = "Preencha o usuário e a senha.";
          } else {
            alert("Preencha o usuário e a senha.");
          }

          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Entrar";
          }
        }
      }, 400);
    });
  }
});