function obterCaixaErro(el) {
  const id = `${el.id || el.name}-erro`;
  let caixa = document.getElementById(id);

  if (!caixa) {
    caixa = document.createElement('small');
    caixa.id = id;
    caixa.className = 'field-error';
    caixa.setAttribute('aria-live', 'polite');
    caixa.hidden = true;

    const alvo =
      el.closest('.input-action, .card-input, .terms') || el;
    alvo.insertAdjacentElement('afterend', caixa);
  }
  return caixa;
}

export function exibirErroInline(el, mensagem) {
  const caixa = obterCaixaErro(el);
  const isCheckbox = el.type === 'checkbox';
  const valido =
    !mensagem &&
    !campoOculto(el) &&
    (isCheckbox ? el.checked : el.value.trim() !== '');

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

  if (el.type === 'checkbox') {
    const mensagem = el.required && !el.checked ? 'Você precisa aceitar os termos para continuar.' : '';
    exibirErroInline(el, mensagem);
    return !mensagem;
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