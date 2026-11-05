document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('carouselTrack');
  const slides = Array.from(track.children);
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const dotsNav = document.getElementById('carouselNav');
  const dots = Array.from(dotsNav.children);

  let currentIndex = 0;

  const updateCarousel = (index) => {
    track.style.transform = `translateX(-${index * 100}%)`;
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('current-slide', i === index);
    });
  };

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel(currentIndex);
  });

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel(currentIndex);
  });

  dotsNav.addEventListener('click', (e) => {
    const targetDot = e.target.closest('button');
    if (!targetDot) return;
    
    currentIndex = dots.indexOf(targetDot);
    updateCarousel(currentIndex);
  });

  setInterval(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel(currentIndex);
  }, 5000);
});