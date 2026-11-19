const API_BASE_URL = 'http://localhost:3000/api';
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`;
const TOKEN_KEY = '@EduScience:token';

document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.querySelector('#form-login');
  const usuarioInput = document.querySelector('#usuario');
  const senhaInput = document.querySelector('#senha');
  const toggleBtn = document.querySelector('#password-toggle');
  const mensagemErro = document.querySelector('#mensagem-erro');
  const btnSubmit = document.querySelector('#submit-button');

  if (toggleBtn && senhaInput) {
    toggleBtn.addEventListener('click', () => {
      const oculta = senhaInput.type === 'password';
      senhaInput.type = oculta ? 'text' : 'password';
      toggleBtn.textContent = oculta ? 'Ocultar' : 'Mostrar';
      toggleBtn.setAttribute('aria-pressed', String(oculta));
      toggleBtn.setAttribute('aria-label', oculta ? 'Ocultar senha' : 'Mostrar senha');
    });
  }

  if (!formLogin) return;

  formLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    evento.stopPropagation();

    const usuario = usuarioInput ? usuarioInput.value.trim() : '';
    const senha = senhaInput ? senhaInput.value : '';

    if (mensagemErro) {
      mensagemErro.textContent = '';
      mensagemErro.hidden = true;
    }

    if (!usuario || !senha) {
      exibirErro('Preencha o usuário (ou e-mail) e a senha.');
      return;
    }

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Entrando...';
    }

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || data.error || data.message || 'Usuário ou senha inválidos.');
      }

      if (!data.token) {
        throw new Error('Token de autenticação não recebido do servidor.');
      }

      localStorage.setItem(TOKEN_KEY, data.token);

      const params = new URLSearchParams(window.location.search);
      const rotaDeRetorno = params.get('next');
      const eRotaSegura =
        rotaDeRetorno &&
        !rotaDeRetorno.includes('://') &&
        !rotaDeRetorno.startsWith('//');

      window.location.href = eRotaSegura ? rotaDeRetorno : 'landing.html';
    } catch (error) {
      exibirErro(error.message || 'Erro de conexão com o servidor.');
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Entrar';
      }
    }
  });

  function exibirErro(texto) {
    if (mensagemErro) {
      mensagemErro.textContent = texto;
      mensagemErro.hidden = false;
    }
  }
});