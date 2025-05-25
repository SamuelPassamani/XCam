import { t } from "./i18n.js";

export function setupCarousel({ intervalMs = 5000 } = {}) {
  const carouselContainer = document.querySelector(".carousel-container");
  const slideWrapper = document.querySelector(".carousel-wrapper");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  let slides = [];
  let indicators = [];
  let currentIndex = 0;
  let intervalId = null;

  // Cria e renderiza slides a partir da API
  async function fetchTopBroadcasts() {
    try {
      const response = await fetch("https://api.xcam.gay/?limit=10");
      const data = await response.json();
      const items = data?.broadcasts?.items || [];

      if (!items.length) {
        carouselContainer.innerHTML = `<div class="carousel-fallback">${t(
          "noBroadcasts.title"
        )}</div>`;
        return;
      }

      items.forEach((item, index) => {
        const slide = document.createElement("div");
        slide.className = "carousel-slide fade";
        if (index === 0) slide.classList.add("active");

        slide.innerHTML = `
          <a href="/cam/?user=${item.username}" class="carousel-link">
            <img src="${item.preview?.poster}" alt="${
          item.username
        }" loading="lazy" />
            <div class="carousel-caption">
              <h3>@${item.username}</h3>
              <p>${item.viewers} ${t("viewers")}</p>
            </div>
          </a>`;

        slideWrapper.appendChild(slide);
        slides.push(slide);

        const indicator = document.createElement("span");
        indicator.className = "carousel-indicator";
        if (index === 0) indicator.classList.add("active");
        indicator.addEventListener("click", () => {
          currentIndex = index;
          updateDisplay();
          resetInterval();
        });
        document.querySelector(".carousel-indicators").appendChild(indicator);
        indicators.push(indicator);
      });

      updateDisplay();
      startInterval();
    } catch (err) {
      console.error("Erro ao carregar carrossel:", err);
    }
  }

  function changeSlide(delta) {
    currentIndex = (currentIndex + delta + slides.length) % slides.length;
    updateDisplay();
  }

  function updateDisplay() {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentIndex);
    });
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle("active", i === currentIndex);
    });
  }

  function startInterval() {
    intervalId = setInterval(() => changeSlide(1), intervalMs);
  }

  function resetInterval() {
    clearInterval(intervalId);
    startInterval();
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      changeSlide(-1);
      resetInterval();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      changeSlide(1);
      resetInterval();
    });
  }

  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", () =>
      clearInterval(intervalId)
    );
    carouselContainer.addEventListener("mouseleave", () => startInterval());
  }

  fetchTopBroadcasts();
}