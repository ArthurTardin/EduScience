export const somenteDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

export const mascaras = {
  cpf(valor) {
    const d = somenteDigitos(valor).slice(0, 11);
    let saida = d.slice(0, 3);
    if (d.length > 3) saida += `.${d.slice(3, 6)}`;
    if (d.length > 6) saida += `.${d.slice(6, 9)}`;
    if (d.length > 9) saida += `-${d.slice(9, 11)}`;
    return saida;
  },

  cep(valor) {
    const d = somenteDigitos(valor).slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  },

  cartao(valor) {
    return somenteDigitos(valor).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
  },

  validade(valor) {
    const d = somenteDigitos(valor).slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  },

  cvv(valor) {
    return somenteDigitos(valor).slice(0, 4);
  }
};

function algoritmoLuhn(digitos) {
  let soma = 0;
  let dobrar = false;
  for (let i = digitos.length - 1; i >= 0; i--) {
    let n = Number(digitos[i]);
    if (dobrar) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    soma += n;
    dobrar = !dobrar;
  }
  return soma % 10 === 0;
}

export const validadores = {
  cpf(valor) {
    const d = somenteDigitos(valor);
    if (d.length !== 11) return 'CPF incompleto: informe os 11 dígitos.';
    if (/^(\d)\1{10}$/.test(d)) return 'CPF inválido.';

    const digitoVerificador = (qtd) => {
      let soma = 0;
      for (let i = 0; i < qtd; i++) soma += Number(d[i]) * (qtd + 1 - i);
      const resto = (soma * 10) % 11;
      return resto === 10 ? 0 : resto;
    };

    if (digitoVerificador(9) !== Number(d[9]) || digitoVerificador(10) !== Number(d[10])) {
      return 'CPF inválido.';
    }
    return '';
  },

  cep(valor) {
    return /^\d{5}-\d{3}$/.test(valor) ? '' : 'Informe um CEP válido (00000-000).';
  },

  email(valor) {
    const valido = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(valor)
      && !valor.includes('..');
    return valido ? '' : 'Informe um e-mail válido (ex.: nome@dominio.com).';
  },

  cartao(valor) {
    const d = somenteDigitos(valor);
    if (d.length < 13) return 'Número do cartão incompleto.';
    if (!algoritmoLuhn(d)) return 'Número de cartão inválido.';
    return '';
  },

  validade(valor) {
    const m = /^(\d{2})\/(\d{2})$/.exec(valor);
    if (!m) return 'Use o formato MM/AA.';

    const mes = Number(m[1]);
    const ano = 2000 + Number(m[2]);
    if (mes < 1 || mes > 12) return 'Mês inválido (01 a 12).';

    const hoje = new Date();
    const vencido = ano < hoje.getFullYear()
      || (ano === hoje.getFullYear() && mes < hoje.getMonth() + 1);
    return vencido ? 'Cartão vencido.' : '';
  },

  cvv(valor) {
    return /^\d{3,4}$/.test(valor) ? '' : 'CVV inválido (3 ou 4 dígitos).';
  },

  nome(valor) {
    return /^\p{L}[\p{L}\s.'-]{2,}$/u.test(valor) ? '' : 'Informe o nome completo.';
  }
};

const SELETOR_CAMPOS =
  'input[required], select[required], textarea[required], [data-mask], [data-validate]';

function campoOculto(el) {
  return el.disabled || Boolean(el.closest('.hidden, [hidden]'));
}

export function obterMensagemErro(el) {
  if (campoOculto(el)) return '';

  const valor = el.value.trim();
  if (!valor) {
    return el.required ? (el.dataset.msgObrigatorio || 'Campo obrigatório.') : '';
  }

  const validador = validadores[el.dataset.validate];
  return validador ? validador(valor) : '';
}

function obterCaixaErro(el) {
  const id = `${el.id || el.name}-erro`;
  let caixa = document.getElementById(id);

  if (!caixa) {
    caixa = document.createElement('small');
    caixa.id = id;
    caixa.className = 'field-error';
    caixa.setAttribute('aria-live', 'polite');
    caixa.hidden = true;
    const alvo = el.closest('.password-wrapper') || el;
    alvo.insertAdjacentElement('afterend', caixa);
  }
  return caixa;
}

function exibirErroInline(el, mensagem) {
  const caixa = obterCaixaErro(el);
  caixa.textContent = mensagem;
  caixa.hidden = !mensagem;

  const preenchido = el.value.trim() !== '';
  el.classList.toggle('is-invalid', Boolean(mensagem));
  el.classList.toggle('is-valid', !mensagem && preenchido && !campoOculto(el));
  el.setAttribute('aria-invalid', mensagem ? 'true' : 'false');

  if (mensagem) el.setAttribute('aria-describedby', caixa.id);
  else el.removeAttribute('aria-describedby');
}

export function validarCampo(el) {
  const mensagem = obterMensagemErro(el);
  exibirErroInline(el, mensagem);
  return !mensagem;
}

export function primeiroCampoInvalido(form) {
  let primeiro = null;
  form.querySelectorAll(SELETOR_CAMPOS).forEach((el) => {
    el.dataset.tocado = 'true';
    if (!validarCampo(el) && !primeiro) primeiro = el;
  });
  return primeiro;
}

function aplicarMascara(el) {
  const mascara = mascaras[el.dataset.mask];
  if (!mascara) return;

  const emFoco = document.activeElement === el;
  const posicao = el.selectionStart;
  const digitosAntesCursor = somenteDigitos(el.value.slice(0, posicao ?? 0)).length;

  el.value = mascara(el.value);

  if (!emFoco || posicao === null) return;
  let novaPosicao = el.value.length;
  if (digitosAntesCursor === 0) {
    novaPosicao = 0;
  } else {
    let contados = 0;
    for (let i = 0; i < el.value.length; i++) {
      if (/\d/.test(el.value[i])) contados++;
      if (contados === digitosAntesCursor) {
        novaPosicao = i + 1;
        break;
      }
    }
  }
  try {
    el.setSelectionRange(novaPosicao, novaPosicao);
  } catch (err) {
  }
}

function configurarCampo(el) {
  if (el.dataset.validacaoIniciada) return;
  el.dataset.validacaoIniciada = 'true';

  el.addEventListener('input', () => {
    aplicarMascara(el);

    const completo = el.maxLength > 0 && el.value.length >= el.maxLength;
    if (el.dataset.tocado === 'true' || completo) {
      el.dataset.tocado = 'true';
      validarCampo(el);
    }
  });

  el.addEventListener('blur', () => {
    el.dataset.tocado = 'true';
    validarCampo(el);
  });

  if (el.tagName === 'SELECT') {
    el.addEventListener('change', () => {
      el.dataset.tocado = 'true';
      validarCampo(el);
    });
  }
}

export function iniciarValidacao(raiz = document) {
  raiz.querySelectorAll(SELETOR_CAMPOS).forEach(configurarCampo);

  raiz.querySelectorAll('form[data-validar-submit]').forEach((form) => {
    if (form.dataset.validacaoSubmit) return;
    form.dataset.validacaoSubmit = 'true';
    form.addEventListener('submit', (evento) => {
      const invalido = primeiroCampoInvalido(form);
      if (invalido) {
        evento.preventDefault();
        evento.stopImmediatePropagation();
        invalido.focus();
      }
    });
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => iniciarValidacao());
  } else {
    iniciarValidacao();
  }
}