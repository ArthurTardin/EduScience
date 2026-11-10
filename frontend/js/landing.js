const CART_STORAGE_KEY = 'eduscience_cart';

document.addEventListener("DOMContentLoaded", () => {
  configurarBotoesAdicionar();
  atualizarContadorHeader();
  inicializarCarrossel();
});

function configurarBotoesAdicionar() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add-cart");
    if (!btn) return;

    const produto = {
      id: Number(btn.dataset.id),
      nome: btn.dataset.nome,
      descricao: btn.dataset.descricao,
      preco: Number(btn.dataset.preco),
      quantidade: 1,
      categoriaClass: btn.dataset.categoria || 'placeholder-chem'
    };

    adicionarAoCarrinho(produto);
  });
}

function adicionarAoCarrinho(novoProduto) {
  let produtos = [];
  try {
    produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (err) {
    produtos = [];
  }

  const itemExistente = produtos.find(p => p.id === novoProduto.id);
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    produtos.push(novoProduto);
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(produtos));
  atualizarContadorHeader();
}

function atualizarContadorHeader() {
  const cartCountEl = document.querySelector(".nav-cart-count");
  if (!cartCountEl) return;

  let produtos = [];
  try {
    produtos = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (err) {
    produtos = [];
  }

  const totalItens = produtos.reduce((acc, item) => acc + (Number(item.quantidade) || 1), 0);
  cartCountEl.textContent = totalItens;
}

function inicializarCarrossel() {
  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const navDots = document.getElementById("carouselNav");

  if (!track || !prevBtn || !nextBtn) return;

  const slides = Array.from(track.children);
  const dots = navDots ? Array.from(navDots.children) : [];
  let currentIndex = 0;

  function moveToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    currentIndex = index;

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    slides.forEach((slide, i) => {
      slide.classList.toggle("current-slide", i === currentIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("current-slide", i === currentIndex);
    });
  }

  nextBtn.addEventListener("click", () => moveToSlide(currentIndex + 1));
  prevBtn.addEventListener("click", () => moveToSlide(currentIndex - 1));

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => moveToSlide(index));
  });
}