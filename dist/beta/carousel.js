export function setupCarousel() {
  const slides = document.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(".carousel-indicator");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");

  let currentIndex = 0;
  let interval = setInterval(() => changeSlide(1), 5000);

  function changeSlide(delta) {
    currentIndex = (currentIndex + delta + slides.length) % slides.length;
    updateDisplay();
  }

  function updateDisplay() {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentIndex);
      indicators[i]?.classList.toggle("active", i === currentIndex);
    });
  }

  indicators.forEach((indicator, i) => {
    indicator.addEventListener("click", () => {
      currentIndex = i;
      updateDisplay();
      resetInterval();
    });
  });

  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(() => changeSlide(1), 5000);
  }

  prevBtn?.addEventListener("click", () => {
    changeSlide(-1);
    resetInterval();
  });

  nextBtn?.addEventListener("click", () => {
    changeSlide(1);
    resetInterval();
  });

  updateDisplay();
}