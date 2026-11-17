export const somenteDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

// 1. MÁSCARAS (Aplicadas em tempo real durante a digitação)
export const mascaras = {
  cnpj_cpf(valor) {
    const d = somenteDigitos(valor);
    if (d.length <= 11) return mascaras.cpf(valor); // É CPF
    // Máscara de CNPJ
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
      .replace(/\D/g, '') // Remove letras
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1'); // Bloqueia após 11 dígitos
  },
  cep(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1'); // Bloqueia após 8 dígitos
  },
  cartao(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{4})(?=\d)/g, '$1 ') // Espaço a cada 4 dígitos
      .substring(0, 19); // Limita a 16 dígitos + 3 espaços
  },
  telefone(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1'); // Bloqueia após o limite
  }
};

// 2. VALIDAÇÕES COM REGEX (Aplicadas no evento de saída do campo - blur)
export const validadores = {
  email(valor) {
    // Regex rigorosa para formato de e-mail (usuario@dominio.com)
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regexEmail.test(valor) ? '' : 'Informe um e-mail válido (ex: nome@escola.com.br).';
  },
  
  cpf(valor) {
    // Validação de formato via Regex
    const regexFormatoCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!regexFormatoCPF.test(valor)) return 'Formato inválido. Use 000.000.000-00.';
    
    // Validação matemática do CPF (Dígitos Verificadores)
    const d = somenteDigitos(valor);
    if (/^(\d)\1{10}$/.test(d)) return 'CPF inválido.'; // Evita "111.111.111-11"
    
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(d.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(d.substring(9, 10))) return 'CPF inválido.';
    
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(d.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(d.substring(10, 11))) return 'CPF inválido.';
    
    return ''; // Válido
  },
  
  cnpj_cpf(valor) {
    const d = somenteDigitos(valor);
    if (d.length <= 11) return this.cpf(valor);
    
    const regexFormatoCNPJ = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (!regexFormatoCNPJ.test(valor)) return 'Formato inválido. Use 00.000.000/0000-00.';
    return '';
  },
  
  cep(valor) {
    // Regex exata para 5 dígitos, hífen, 3 dígitos
    const regexCep = /^\d{5}-\d{3}$/;
    return regexCep.test(valor) ? '' : 'Informe um CEP válido (00000-000).';
  },
  
  cartao(valor) {
    const regexCartao = /^(\d{4}\s){3}\d{4}$/;
    return regexCartao.test(valor) ? '' : 'Informe um número de cartão válido (16 dígitos).';
  }
};

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
  caixa.textContent = mensagem;
  caixa.hidden = !mensagem; 

  el.classList.toggle('invalid', Boolean(mensagem));
  el.classList.toggle('is-valid', !mensagem && el.value.trim() !== '');
}

export function validarCampo(el) {
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


export function iniciarValidacao() {
  const campos = document.querySelectorAll('input[data-mask], input[data-validate]');
  
  campos.forEach(el => {
    
    el.addEventListener('input', (e) => {
      const mascara = mascaras[el.dataset.mask];
      if (mascara) {
        const cursor = el.selectionStart;
        e.target.value = mascara(e.target.value);
        if (cursor) el.setSelectionRange(cursor, cursor);
      }
      exibirErroInline(el, ''); 
    });

    
    el.addEventListener('blur', () => {
      validarCampo(el);
    });
  });
}


if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', iniciarValidacao);
}