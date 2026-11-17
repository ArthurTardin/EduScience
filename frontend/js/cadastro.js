import {
  somenteDigitos,
  mascaras,
  validadores,
  validarCampo,
  primeiroCampoInvalido,
  iniciarValidacao
} from './validacoes.js';

const API_BASE_URL = 'http://localhost:3000/api';
const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`;
const TOKEN_KEY = '@EduScience:token';

mascaras.cnpj_cpf = (valor) => {
  const d = somenteDigitos(valor).slice(0, 14);
  if (d.length <= 11) return mascaras.cpf(d);
  let saida = d.slice(0, 2);
  if (d.length > 2) saida += `.${d.slice(2, 5)}`;
  if (d.length > 5) saida += `.${d.slice(5, 8)}`;
  if (d.length > 8) saida += `/${d.slice(8, 12)}`;
  if (d.length > 12) saida += `-${d.slice(12, 14)}`;
  return saida;
};

mascaras.telefone = (valor) => {
  const d = somenteDigitos(valor).slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
};

validadores.cnpj_cpf = (valor) => {
  const d = somenteDigitos(valor);
  if (d.length <= 11) return validadores.cpf(valor);
  if (d.length !== 14) return 'CNPJ incompleto: informe os 14 dígitos.';
  if (/^(\d)\1{13}$/.test(d)) return 'CNPJ inválido.';

  const calc = (base, pesos) => {
    const soma = base.split('').reduce((acc, n, i) => acc + Number(n) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calc(d.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(d.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(d[12]) && d2 === Number(d[13]) ? '' : 'CNPJ inválido.';
};

validadores.telefone = (valor) => {
  const d = somenteDigitos(valor);
  return d.length === 10 || d.length === 11 ? '' : 'Informe um telefone válido com DDD.';
};

validadores.usuario = (valor) => {
  return /^[a-z0-9._-]{3,50}$/.test(valor)
    ? ''
    : 'Use 3 a 50 caracteres (letras minúsculas, números, ponto, _ ou -).';
};

validadores.senha = (valor) => {
  return valor.length >= 6 ? '' : 'A senha deve ter pelo menos 6 caracteres.';
};

validadores.confirmarSenha = (valor) => {
  const senha = document.getElementById('senha')?.value || '';
  return valor === senha ? '' : 'As senhas não coincidem.';
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastro-form');
  if (!form) return;

  iniciarValidacao(form);

  const cepInput = document.getElementById('cep');
  const usuarioInput = document.getElementById('usuario');
  const senhaInput = document.getElementById('senha');
  const confirmarInput = document.getElementById('confirmar-senha');

  usuarioInput.addEventListener('input', () => {
    usuarioInput.value = usuarioInput.value.replace(/\s+/g, '').toLowerCase();
  });

  senhaInput.addEventListener('input', () => {
    if (confirmarInput.dataset.tocado === 'true') {
      validarCampo(confirmarInput);
    }
  });

  cepInput.addEventListener('blur', () => buscarCep(cepInput));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarAlerta();

    const invalido = primeiroCampoInvalido(form);
    if (invalido) {
      invalido.focus();
      exibirAlerta('Corrija os campos destacados antes de finalizar.', 'error');
      return;
    }

    const complementoVal = document.getElementById('complemento').value.trim();

    const payload = {
      nome_escola: document.getElementById('nome_escola').value.trim(),
      cnpj_cpf: document.getElementById('cnpj_cpf').value.trim(),
      email: document.getElementById('email').value.trim().toLowerCase(),
      telefone: document.getElementById('telefone').value.trim(),
      logradouro: document.getElementById('logradouro').value.trim(),
      numero: document.getElementById('numero').value.trim(),
      complemento: complementoVal || null,
      bairro: document.getElementById('bairro').value.trim(),
      cidade: document.getElementById('cidade').value.trim(),
      estado: document.getElementById('estado').value.trim().toUpperCase(),
      cep: cepInput.value.trim(),
      usuario: usuarioInput.value.trim(),
      senha: senhaInput.value
    };

    const btnSubmit = document.getElementById('btn-cadastrar');
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Cadastrando...';

    try {
      const response = await fetch(REGISTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.erro || data.message || 'Não foi possível concluir o cadastro.');
      }

      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        exibirAlerta('Escola cadastrada com sucesso! Redirecionando...', 'success');
        setTimeout(() => { window.location.href = 'landing.html'; }, 1200);
      } else {
        exibirAlerta('Cadastro realizado com sucesso! Redirecionando para o login...', 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      }
    } catch (error) {
      exibirAlerta(error.message || 'Erro de conexão com o servidor.', 'error');
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Finalizar Cadastro';
    }
  });
});

async function buscarCep(cepInput) {
  const cep = somenteDigitos(cepInput.value);
  if (cep.length !== 8) return;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) return;

    const campos = {
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf
    };

    Object.entries(campos).forEach(([id, valor]) => {
      const el = document.getElementById(id);
      if (el && valor) {
        el.value = valor;
        el.dataset.tocado = 'true';
        validarCampo(el);
      }
    });
  } catch {
  }
}

function exibirAlerta(mensagem, tipo = 'error') {
  const alertEl = document.getElementById('feedback-alert');
  if (!alertEl) return;
  alertEl.textContent = mensagem;
  alertEl.className = `alert show alert-${tipo}`;
}

function ocultarAlerta() {
  const alertEl = document.getElementById('feedback-alert');
  if (!alertEl) return;
  alertEl.className = 'alert';
  alertEl.textContent = '';
}