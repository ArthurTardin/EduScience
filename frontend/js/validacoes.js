export const somenteDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

export const mascaras = {
  cnpj_cpf(valor) {
    const d = somenteDigitos(valor);
    if (d.length <= 11) return mascaras.cpf(valor);
    return valor
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  },
  cpf(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  },
  cep(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  },
  cartao(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .substring(0, 19);
  },
  validade(valor) {
    const d = somenteDigitos(valor).slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  },
  cvv(valor) {
    return somenteDigitos(valor).slice(0, 4);
  },
  telefone(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
};

export const validadores = {
  email(valor) {
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regexEmail.test(valor) ? '' : 'Informe um e-mail válido (ex: nome@escola.com.br).';
  },

  cpf(valor) {
    const regexFormatoCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!regexFormatoCPF.test(valor)) return 'Formato inválido. Use 000.000.000-00.';

    const d = somenteDigitos(valor);
    if (/^(\d)\1{10}$/.test(d)) return 'CPF inválido.';

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(d.substring(i - 1, i), 10) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(d.substring(9, 10), 10)) return 'CPF inválido.';

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(d.substring(i - 1, i), 10) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(d.substring(10, 11), 10)) return 'CPF inválido.';

    return '';
  },

  cnpj_cpf(valor) {
    const d = somenteDigitos(valor);
    if (d.length <= 11) return validadores.cpf(valor);

    const regexFormatoCNPJ = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (!regexFormatoCNPJ.test(valor)) return 'Formato inválido. Use 00.000.000/0000-00.';
    return '';
  },

  cep(valor) {
    const regexCep = /^\d{5}-\d{3}$/;
    return regexCep.test(valor) ? '' : 'Informe um CEP válido (00000-000).';
  },

  cartao(valor) {
    const regexCartao = /^(\d{4}\s){3}\d{4}$/;
    return regexCartao.test(valor) ? '' : 'Informe um número de cartão válido (16 dígitos).';
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
  }
};

const SELETOR_CAMPOS = 'input[required], select[required], textarea[required], [data-mask], [data-validate]';

function campoOculto(el) {
  return el.disabled || Boolean(el.closest('.hidden, [hidden]'));
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
    el.insertAdjacentElement('afterend', caixa);
  }
  return caixa;
}

export function exibirErroInline(el, mensagem) {
  const caixa = obterCaixaErro(el);
  const valido = !mensagem && el.value.trim() !== '' && !campoOculto(el);

  caixa.textContent = mensagem;
  caixa.hidden = !mensagem;

  el.classList.toggle('is-invalid', Boolean(mensagem));
  el.classList.toggle('invalid', Boolean(mensagem));
  el.classList.toggle('is-valid', valido);
  el.classList.toggle('valid', valido);

  el.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
  if (mensagem) {
    el.setAttribute('aria-describedby', caixa.id);
  } else {
    el.removeAttribute('aria-describedby');
  }
}

export function validarCampo(el) {
  if (campoOculto(el)) {
    exibirErroInline(el, '');
    return true;
  }

  const valor = el.value.trim();
  const validador = validadores[el.dataset.validate];

  let mensagem = '';

  if (!valor && el.required) {
    mensagem = 'Este campo é obrigatório.';
  } else if (valor && validador) {
    mensagem = validador(valor);
  }

  exibirErroInline(el, mensagem);
  return !mensagem;
}

export function primeiroCampoInvalido(form) {
  let primeiro = null;
  form.querySelectorAll(SELETOR_CAMPOS).forEach((el) => {
    el.dataset.tocado = 'true';
    if (!validarCampo(el) && !primeiro) {
      primeiro = el;
    }
  });
  return primeiro;
}

export function iniciarValidacao(raiz = document) {
  const campos = raiz.querySelectorAll(SELETOR_CAMPOS);

  campos.forEach((el) => {
    if (el.dataset.validacaoIniciada) return;
    el.dataset.validacaoIniciada = 'true';

    el.addEventListener('input', (e) => {
      const mascara = mascaras[el.dataset.mask];
      if (mascara) {
        const cursor = el.selectionStart;
        const antes = e.target.value.length;
        e.target.value = mascara(e.target.value);
        const diff = e.target.value.length - antes;
        if (cursor !== null) {
          const novaPos = Math.max(0, cursor + diff);
          try { el.setSelectionRange(novaPos, novaPos); } catch {}
        }
      }
      exibirErroInline(el, '');
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
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => iniciarValidacao());
  } else {
    iniciarValidacao();
  }
}